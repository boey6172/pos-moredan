const StartingCash = require('../models/StartingCash');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;
const { getDayBoundsInPH } = require('../utils/phTime');

exports.createStartingCash = async (req, res) => {
  try {
    const { starting } = req.body;

    // Validate required field
    if (starting === undefined || starting === null || starting === "") {
      return res.status(400).json({ message: "Starting cash amount is required" });
    }

    // Validate number
    const amount = parseFloat(starting);
    if (isNaN(amount)) {
      return res.status(400).json({ message: "Starting must be a valid number" });
    }

    // Use Philippine time so "today" is the current calendar day in PH
    const now = new Date();
    const { start: startOfDay, end: endOfDay } = getDayBoundsInPH(now);

    const existing = await StartingCash.findOne({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    let startingCash;

    if (existing) {
      // Same date: update the existing record (e.g. user edited amount)
      existing.starting = amount;
      await existing.save();
      startingCash = existing;
    } else {
      // New date: create a new starting cash record for today
      startingCash = await StartingCash.create({ starting: amount });
    }

    res.status(201).json(startingCash);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create Starting Cash", error: err.message });
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
      // Get data created within that specific day (Philippine time, UTC+8)
      const startOfDay = new Date(date + 'T00:00:00.000+08:00');
      const endOfDay = new Date(date + 'T23:59:59.999+08:00');

      where.createdAt = {
        [Op.between]: [startOfDay, endOfDay],
      };
    } else {
      // No date provided: use today in Philippine time
      const { start: startOfDay, end: endOfDay } = getDayBoundsInPH(new Date());
      where.createdAt = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    const startingCash = await StartingCash.findOne({
      where,
      order: [["createdAt", "ASC"]],
    });

    // Return empty array if not found (so frontend knows no cash set for today)
    res.json(startingCash ? [startingCash] : []);
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
    if (starting !== undefined) startingCash.starting = starting;
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