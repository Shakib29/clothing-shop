const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products.product', 'name images basePrice featuredImage');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId, variant } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [] });
    }

    const exists = wishlist.products.some(
      item => item.product.toString() === productId &&
        item.variant?.color === variant?.color &&
        item.variant?.size === variant?.size
    );

    if (exists) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    wishlist.products.push({ product: productId, variant });
    await wishlist.save();

    wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products.product', 'name images basePrice featuredImage');

    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      item => item.product.toString() !== productId
    );
    await wishlist.save();

    wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products.product', 'name images basePrice featuredImage');

    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
