const Permission = require('../models/Permission');

exports.listPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({ order: [['code', 'ASC']] });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch permissions', error: err.message });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Name and code are required.' });
    }
    const codeNorm = String(code).trim().toLowerCase().replace(/\s+/g, '.');
    const existing = await Permission.findOne({ where: { code: codeNorm } });
    if (existing) return res.status(409).json({ message: 'Permission code already exists.' });
    const permission = await Permission.create({
      name: name.trim(),
      code: codeNorm,
      description: description ? description.trim() : null,
    });
    res.status(201).json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create permission', error: err.message });
  }
};

exports.updatePermission = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });
    if (name !== undefined) permission.name = name.trim();
    if (code !== undefined) {
      const codeNorm = String(code).trim().toLowerCase().replace(/\s+/g, '.');
      const existing = await Permission.findOne({ where: { code: codeNorm } });
      if (existing && existing.id !== permission.id) {
        return res.status(409).json({ message: 'Permission code already exists.' });
      }
      permission.code = codeNorm;
    }
    if (description !== undefined) permission.description = description ? description.trim() : null;
    await permission.save();
    res.json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update permission', error: err.message });
  }
};

exports.deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });
    await permission.destroy();
    res.json({ message: 'Permission deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete permission', error: err.message });
  }
};
