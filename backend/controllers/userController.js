const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'roleId', 'createdAt'],
      include: [{ model: Role, as: 'roleRef', attributes: ['id', 'name'], required: false }],
    });
    const list = users.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      roleId: u.roleId,
      roleName: u.roleRef ? u.roleRef.name : u.role || 'Cashier',
      createdAt: u.createdAt,
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, password, roleId } = req.body;
    if (!username || !password || !roleId) {
      return res.status(400).json({ message: 'Username, password, and role are required.' });
    }
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'Username already exists.' });
    const role = await Role.findByPk(roleId);
    if (!role) return res.status(400).json({ message: 'Invalid role.' });
    const hashed = await bcrypt.hash(password, 10);
    const legacyRole = role.name === 'Admin' ? 'admin' : 'cashier';
    const user = await User.create({ username, password: hashed, roleId: Number(roleId), role: legacyRole });
    const withRole = await User.findByPk(user.id, { include: [{ model: Role, as: 'roleRef', attributes: ['id', 'name'] }] });
    res.status(201).json({
      id: withRole.id,
      username: withRole.username,
      roleId: withRole.roleId,
      roleName: withRole.roleRef ? withRole.roleRef.name : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, roleId } = req.body;
    const user = await User.findByPk(req.params.id, { include: [{ model: Role, as: 'roleRef', required: false }] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isSelf = Number(req.params.id) === req.user?.id;
    if (isSelf && roleId !== undefined && user.roleId !== Number(roleId)) {
      return res.status(403).json({ message: 'You cannot change your own role.' });
    }
    if (username !== undefined) user.username = username.trim();
    if (roleId !== undefined) {
      const role = await Role.findByPk(roleId);
      if (!role) return res.status(400).json({ message: 'Invalid role.' });
      user.roleId = Number(roleId);
      user.role = role.name === 'Admin' ? 'admin' : 'cashier';
    }
    await user.save();
    const updated = await User.findByPk(user.id, { include: [{ model: Role, as: 'roleRef', attributes: ['id', 'name'] }] });
    res.json({
      id: updated.id,
      username: updated.username,
      roleId: updated.roleId,
      roleName: updated.roleRef ? updated.roleRef.name : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // RBAC: prevent current user from deleting themselves
    if (Number(req.params.id) === req.user?.id) {
      return res.status(403).json({ message: 'You cannot delete your own account.' });
    }
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'Password reset' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
}; 