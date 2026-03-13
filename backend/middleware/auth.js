const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { CASHIER_PERMISSION_CODES } = require('../seed/rbacSeed');

exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

/** Load user's permission codes onto req.user.permissions (for RBAC). Call after authenticateJWT when using requirePermission. */
exports.loadUserPermissions = async (req, res, next) => {
  if (!req.user || !req.user.id) return next();
  if (req.user.permissions) return next();
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'roleRef', include: [{ model: Permission, as: 'Permissions' }], required: false }],
      attributes: ['id', 'role', 'roleId'],
    });
    if (!user) {
      req.user.permissions = [];
      return next();
    }
    if (user.roleId && user.roleRef && user.roleRef.Permissions) {
      req.user.permissions = user.roleRef.Permissions.map((p) => p.code);
    } else {
      req.user.permissions = user.role === 'admin'
        ? (await Permission.findAll({ attributes: ['code'] })).map((p) => p.code)
        : CASHIER_PERMISSION_CODES;
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load permissions.', error: err.message });
  }
};

/** Require one of the given permission codes. Use after authenticateJWT and loadUserPermissions. */
exports.requirePermission = (...permissionCodes) => async (req, res, next) => {
  await exports.loadUserPermissions(req, res, () => {});
  if (!req.user || !req.user.permissions) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  const hasAny = permissionCodes.some((code) => req.user.permissions.includes(code));
  if (!hasAny) {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }
  next();
};

exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  next();
}; 