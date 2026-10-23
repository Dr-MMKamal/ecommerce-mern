const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  res.json(await Category.find({}).sort('name'));
});

// @route POST /api/categories  (admin)
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
    description: req.body.description,
  });
  res.status(201).json(category);
});

// @route PUT /api/categories/:id  (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  category.name = req.body.name ?? category.name;
  category.description = req.body.description ?? category.description;
  res.json(await category.save());
});

// @route DELETE /api/categories/:id  (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.exists({ category: req.params.id });
  if (inUse) {
    res.status(400);
    throw new Error('Cannot delete a category that still has products');
  }
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.json({ message: 'Category removed' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
