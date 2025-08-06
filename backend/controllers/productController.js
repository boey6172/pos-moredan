const Product = require('../models/Product');
const Category = require('../models/Category');
const path = require('path');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, sku, inventory, categoryId } = req.body;
    let image = null;
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }
    const product = await Product.create({ name, price, sku, inventory, categoryId, image });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ include: Category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Category });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, sku, inventory, categoryId } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.file) {
      product.image = '/uploads/' + req.file.filename;
    }
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.sku = sku ?? product.sku;
    product.inventory = inventory ?? product.inventory;
    product.categoryId = categoryId ?? product.categoryId;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
}; 