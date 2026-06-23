const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const generateOrderNumber = require('../utils/generateOrderNumber');
const sendEmail = require('../utils/sendEmail');

const generateWhatsAppLink = (order) => {
  const hasWhatsApp = process.env.WHATSAPP_PHONE && process.env.WHATSAPP_PHONE !== '+1234567890';
  if (!hasWhatsApp) return null;

  const itemsText = order.items.map(item =>
    `${item.name}\nSize: ${item.variant.size}\nColor: ${item.variant.color}\nQty: ${item.quantity}`
  ).join('\n\n');

  const message = `New Order: ${order.orderNumber}\n\n` +
    `Customer Name: ${order.shippingDetails.name}\n` +
    `Phone: ${order.shippingDetails.phone}\n\n` +
    `Products:\n${itemsText}\n\n` +
    `Delivery Method: ${order.deliveryMethod === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}\n` +
    `Address: ${order.shippingDetails.address.street}, ${order.shippingDetails.address.city}, ${order.shippingDetails.address.state} ${order.shippingDetails.address.zipCode}\n\n` +
    `Total: ₹${order.total}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${process.env.WHATSAPP_PHONE}?text=${encodedMessage}`;
};

const sendOrderConfirmationEmail = async (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.variant.color} / ${item.variant.size}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">₹${item.price}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Confirmation</h2>
      <p>Dear ${order.shippingDetails.name},</p>
      <p>Thank you for your order! Your order number is <strong>${order.orderNumber}</strong>.</p>
      
      <h3 style="color: #333;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; border: 1px solid #ddd;">Product</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Variant</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Qty</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      
      <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
      <p><strong>Shipping:</strong> ₹${order.shippingCost}</p>
      <p><strong>Total:</strong> ₹${order.total}</p>
      
      <h3 style="color: #333;">Delivery Information</h3>
      <p><strong>Method:</strong> ${order.deliveryMethod === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
      <p><strong>Address:</strong><br>
      ${order.shippingDetails.address.street}<br>
      ${order.shippingDetails.address.city}, ${order.shippingDetails.address.state}<br>
      ${order.shippingDetails.address.zipCode}</p>
      
      <p>We will contact you shortly to confirm your order.</p>
    </div>
  `;

  await sendEmail({
    to: order.shippingDetails.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html,
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { shippingDetails, deliveryMethod, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const variant = product.variants.find(v => v.sku === item.variant.sku);
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name} - ${variant?.color || ''} / ${variant?.size || ''}`,
        });
      }
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
      image: item.product.featuredImage,
    }));

    const subtotal = cart.subtotal;
    const shippingCost = deliveryMethod === 'home_delivery' ? 100 : 0;
    const total = subtotal + shippingCost;

    const order = await Order.create({
      user: req.user.id,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      shippingDetails,
      deliveryMethod,
      subtotal,
      shippingCost,
      total,
      notes,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const variant = product.variants.find(v => v.sku === item.variant.sku);
      variant.stock -= item.quantity;
      await product.save();
    }

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    try {
      await sendOrderConfirmationEmail(order);
      order.emailSent = true;
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    const whatsappLink = generateWhatsAppLink(order);
    if (whatsappLink) {
      order.whatsappSent = true;
    }
    await order.save();

    res.status(201).json({
      success: true,
      data: order,
      whatsappLink,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({ status, note, updatedBy: req.user.id });
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
