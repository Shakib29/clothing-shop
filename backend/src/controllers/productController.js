const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12, minPrice, maxPrice } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { basePrice: 1 };
    else if (sort === 'price_desc') sortOption = { basePrice: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else sortOption = { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.viewCount += 1;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true, isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.path);
      productData.featuredImage = productData.images[0];
    }
    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productData = req.body;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      productData.images = [...(productData.existingImages || []), ...newImages];
      if (!productData.featuredImage && productData.images.length > 0) {
        productData.featuredImage = productData.images[0];
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { variantId, stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    variant.stock = stock;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({
      isActive: true,
      'variants.stock': { $lte: threshold },
    }).populate('category', 'name');

    const lowStockItems = [];
    products.forEach(product => {
      product.variants.forEach(variant => {
        if (variant.stock <= threshold) {
          lowStockItems.push({
            product: product._id,
            productName: product.name,
            variant: variant._id,
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            stock: variant.stock,
          });
        }
      });
    });

    res.json({ success: true, data: lowStockItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
