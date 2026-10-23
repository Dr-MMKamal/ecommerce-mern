const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/products?keyword=&category=&minPrice=&maxPrice=&sort=&page=&limit=
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, featured } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 100);

  const filter = {};
  if (keyword) filter.$text = { $search: keyword };
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    'price-asc': 'price',
    'price-desc': '-price',
    rating: '-rating',
    newest: '-createdAt',
  };
  const sortBy = sortMap[sort] || '-createdAt';

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort(sortBy)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ products, page, pages: Math.ceil(total / limit), total });
});

// @route GET /api/products/top
const getTopProducts = asyncHandler(async (req, res) => {
  res.json(await Product.find({}).sort('-rating').limit(4).populate('category', 'name'));
});

// @route GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @route POST /api/products  (admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, countInStock, images, brand, category, featured } = req.body;
  const product = await Product.create({
    name,
    description,
    price,
    countInStock,
    images,
    brand,
    category,
    featured,
  });
  res.status(201).json(product);
});

// @route PUT /api/products/:id  (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const fields = ['name', 'description', 'price', 'countInStock', 'images', 'brand', 'category', 'featured'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });
  res.json(await product.save());
});

// @route DELETE /api/products/:id  (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

// @route POST /api/products/:id/reviews  (private)
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.reviews.some((r) => String(r.user) === String(req.user._id))) {
    res.status(400);
    throw new Error('You already reviewed this product');
  }
  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ message: 'Review added' });
});

module.exports = {
  getProducts,
  getTopProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
};
