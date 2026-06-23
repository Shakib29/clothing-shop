const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  variant: {
    color: String,
    size: String,
    sku: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
  },
  items: [orderItemSchema],
  shippingDetails: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
  },
  deliveryMethod: {
    type: String,
    enum: ['home_delivery', 'store_pickup'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    note: String,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  shippingCost: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  whatsappSent: {
    type: Boolean,
    default: false,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
