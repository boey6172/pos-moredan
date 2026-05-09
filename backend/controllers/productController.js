const Product = require('../models/Product');
const Category = require('../models/Category');
const Material = require('../models/Material');
const path = require('path');

const materialPayload = (body) => {
  const materialId =
    body.materialId !== undefined && body.materialId !== null && String(body.materialId).trim() !== ''
      ? parseInt(body.materialId, 10)
      : null;
  const materialQuantityPerUnit =
    body.materialQuantityPerUnit !== undefined &&
    body.materialQuantityPerUnit !== null &&
    String(body.materialQuantityPerUnit).trim() !== ''
      ? String(body.materialQuantityPerUnit)
      : '1';
  const materialDeductionMode = body.materialDeductionMode || 'NONE';
  return { materialId: Number.isFinite(materialId) ? materialId : null, materialQuantityPerUnit, materialDeductionMode };
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, sku, inventory, categoryId, costToMake } = req.body;
    const mp = materialPayload(req.body);
    let image = null;
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }
    const product = await Product.create({
      name,
      price,
      sku,
      inventory,
      categoryId,
      image,
      costToMake,
      materialId: mp.materialId,
      materialQuantityPerUnit: mp.materialQuantityPerUnit,
      materialDeductionMode: mp.materialDeductionMode,
    });
    const full = await Product.findByPk(product.id, {
      include: [Category, { model: Material, as: 'linkedMaterial', required: false }],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [Category, { model: Material, as: 'linkedMaterial', required: false }],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [Category, { model: Material, as: 'linkedMaterial', required: false }],
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, sku, inventory, categoryId, costToMake } = req.body;
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
    product.costToMake = costToMake ?? product.costToMake;
    if (
      req.body.materialId !== undefined ||
      req.body.materialQuantityPerUnit !== undefined ||
      req.body.materialDeductionMode !== undefined
    ) {
      const mp = materialPayload(req.body);
      product.materialId = mp.materialId;
      product.materialQuantityPerUnit = mp.materialQuantityPerUnit;
      product.materialDeductionMode = mp.materialDeductionMode;
    }
    await product.save();
    const full = await Product.findByPk(product.id, {
      include: [Category, { model: Material, as: 'linkedMaterial', required: false }],
    });
    res.json(full);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

exports.getProductBySku = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOne({
      where: { sku },
      include: [Category, { model: Material, as: 'linkedMaterial', required: false }],
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
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