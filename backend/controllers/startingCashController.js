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

exports.getStartingCashByDate = async (req, res) => {
  try {
    // frontend should send ?date=YYYY-MM-DD
    const { date } = req.query;

    let where = {};
    if (date) {
      // Get all data created within that day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    const startingCash = await StartingCash.findOne({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json(startingCash);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch Starting Cash",
      error: err.message,
    });
  }
}

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
    const starting = await StartingCash.findByPk(req.params.id);
    if (!starting) return res.status(404).json({ message: 'Starting Cash not found' });
    await starting.destroy();
    res.json({ message: 'Starting Cash deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete Starting Cash', error: err.message });
  }
}; 