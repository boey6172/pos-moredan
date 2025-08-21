const StartingCash = require('../models/StartingCash');

exports.createStartingCash = async (req, res) => {
  try {
    const { starting } = req.body;
    const startingCash = await StartingCash.create({ starting });
    res.status(201).json(startingCash);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create Starting Cash', error: err.message });
  }
};

exports.getStartingCash = async (req, res) => {
  try {
    const startingCash = await StartingCash.findAll();
    res.json(startingCash);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Starting Cash', error: err.message });
  }
};

exports.getStartingCashById = async (req, res) => {
  try {
    const startingCash = await StartingCash.findByPk(req.params.id);
    if (!startingCash) return res.status(404).json({ message: 'Starting Cash not found' });
    res.json(startingCash);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Starting Cash', error: err.message });
  }
};

exports.updateStartingCash = async (req, res) => {
  try {
    const { starting } = req.body;
    const startingCash = await StartingCash.findByPk(req.params.id);
    if (!startingCash) return res.status(404).json({ message: 'Starting Cash not found' });
    startingCash.name = starting ?? startingCash.name;
    startingCash.description = description ?? startingCash.description;
    await startingCash.save();
    res.json(startingCash);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update Starting Cash', error: err.message });
  }
};

exports.deleteStartingCash = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
}; 