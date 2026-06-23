const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true,
  },
  colorCode: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  images: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative'],
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative'],
    default: 0,
  },
  variants: [variantSchema],
  images: [{
    type: String,
  }],
  featuredImage: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  weight: {
    type: Number,
    default: 0,
  },
  material: {
    type: String,
    trim: true,
  },
  careInstructions: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

productSchema.virtual('totalStock').get(function() {
  return this.variants.reduce((sum, variant) => sum + variant.stock, 0);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
