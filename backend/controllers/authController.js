const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { CASHIER_PERMISSION_CODES } = require('../seed/rbacSeed');

exports.register = async (req, res) => {
  try {
    const { username, password, roleId, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    let finalRoleId = roleId ? Number(roleId) : null;
    if (!finalRoleId && role) {
      const Role = require('../models/Role');
      const r = await Role.findOne({ where: { name: role === 'admin' ? 'Admin' : 'Cashier' } });
      if (r) finalRoleId = r.id;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, roleId: finalRoleId, role: role || null });
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'roleRef', include: [{ model: Permission, as: 'Permissions' }], required: false }],
      attributes: ['id', 'username', 'role', 'roleId'],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    let permissionCodes = getPermissionCodes(user);
    if (!permissionCodes && user.role === 'admin') {
      permissionCodes = (await Permission.findAll({ attributes: ['code'] })).map((p) => p.code);
    }
    if (!permissionCodes && user.roleRef && user.roleRef.name === 'Admin') {
      permissionCodes = (await Permission.findAll({ attributes: ['code'] })).map((p) => p.code);
    }
    const roleName = user.roleRef ? user.roleRef.name : user.role || 'Cashier';
    const isAdmin = user.role === 'admin' || (user.roleRef && user.roleRef.name === 'Admin');
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: isAdmin ? 'admin' : (user.role || 'cashier'),
        roleId: user.roleId,
        roleName,
        permissions: permissionCodes || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load user', error: err.message });
  }
};

function getPermissionCodes(user) {
  if (user.roleId && user.roleRef && user.roleRef.Permissions) {
    return user.roleRef.Permissions.map((p) => p.code);
  }
  if (user.role === 'admin') return null; // all permissions, resolved in middleware
  return CASHIER_PERMISSION_CODES;
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const user = await User.findOne({
      where: { username },
      include: [{ model: Role, as: 'roleRef', include: [{ model: Permission, as: 'Permissions' }], required: false }],
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }
    let permissionCodes = getPermissionCodes(user);
    if (!permissionCodes && (user.role === 'admin' || (user.roleRef && user.roleRef.name === 'Admin'))) {
      permissionCodes = (await Permission.findAll({ attributes: ['code'] })).map((p) => p.code);
    }
    const roleName = user.roleRef ? user.roleRef.name : user.role || 'Cashier';
    const isAdmin = user.role === 'admin' || (user.roleRef && user.roleRef.name === 'Admin');
    const roleForToken = isAdmin ? 'admin' : (user.role || 'cashier');
    const token = jwt.sign(
      { id: user.id, username: user.username, role: roleForToken, roleId: user.roleId, roleName },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: roleForToken,
        roleId: user.roleId,
        roleName,
        permissions: permissionCodes || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
}; 