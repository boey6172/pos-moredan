const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');

exports.listRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']],
      include: [{ model: Permission, as: 'Permissions', attributes: ['id', 'code', 'name'], through: { attributes: [] } }],
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch roles', error: err.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const existing = await Role.findOne({ where: { name: name.trim() } });
    if (existing) return res.status(409).json({ message: 'Role name already exists.' });
    const role = await Role.create({ name: name.trim(), description: description ? description.trim() : null });
    if (Array.isArray(permissionIds) && permissionIds.length > 0) {
      await role.setPermissions(permissionIds);
    }
    const withPerms = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'Permissions', attributes: ['id', 'code', 'name'], through: { attributes: [] } }],
    });
    res.status(201).json(withPerms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create role', error: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (name !== undefined) {
      const existing = await Role.findOne({ where: { name: name.trim() } });
      if (existing && existing.id !== role.id) return res.status(409).json({ message: 'Role name already exists.' });
      role.name = name.trim();
    }
    if (description !== undefined) role.description = description ? description.trim() : null;
    await role.save();
    if (Array.isArray(permissionIds)) {
      await role.setPermissions(permissionIds);
    }
    const withPerms = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'Permissions', attributes: ['id', 'code', 'name'], through: { attributes: [] } }],
    });
    res.json(withPerms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    const userCount = await User.count({ where: { roleId: role.id } });
    if (userCount > 0) {
      return res.status(400).json({ message: `Cannot delete role: ${userCount} user(s) are assigned. Reassign them first.` });
    }
    await role.destroy();
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete role', error: err.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{ model: Permission, as: 'Permissions', attributes: ['id', 'code', 'name'], through: { attributes: [] } }],
    });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch role', error: err.message });
  }
};
