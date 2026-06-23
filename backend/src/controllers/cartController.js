const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name images featuredImage');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, variant, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const selectedVariant = product.variants.find(
      v => v.color === variant.color && v.size === variant.size
    );
    if (!selectedVariant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    if (selectedVariant.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId &&
        item.variant.sku === selectedVariant.sku
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (selectedVariant.stock < newQuantity) {
        return res.status(400).json({ success: false, message: 'Not enough stock available' });
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        variant: {
          color: selectedVariant.color,
          size: selectedVariant.size,
          sku: selectedVariant.sku,
        },
        quantity,
        price: selectedVariant.price,
      });
    }

    await cart.save();
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name images featuredImage');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const product = await Product.findById(item.product);
    const variant = product.variants.find(v => v.sku === item.variant.sku);

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      if (variant.stock < quantity) {
        return res.status(400).json({ success: false, message: 'Not enough stock available' });
      }
      item.quantity = quantity;
    }

    await cart.save();
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name images featuredImage');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items.pull(itemId);
    await cart.save();

    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name images featuredImage');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
