const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');
const sequelize = require('../config/database');

const DEFAULT_PERMISSIONS = [
  { code: 'dashboard.view', name: 'View Dashboard', description: 'Access dashboard' },
  { code: 'pos.use', name: 'Use POS', description: 'Use point of sale' },
  { code: 'products.view', name: 'View Products', description: 'View products' },
  { code: 'products.create', name: 'Create Products', description: 'Create products' },
  { code: 'products.update', name: 'Update Products', description: 'Edit products' },
  { code: 'products.delete', name: 'Delete Products', description: 'Delete products' },
  { code: 'categories.view', name: 'View Categories', description: 'View categories' },
  { code: 'categories.create', name: 'Create Categories', description: 'Create categories' },
  { code: 'categories.update', name: 'Update Categories', description: 'Edit categories' },
  { code: 'categories.delete', name: 'Delete Categories', description: 'Delete categories' },
  { code: 'inventory.view', name: 'View Inventory', description: 'View inventory' },
  { code: 'inventory.adjust', name: 'Adjust Inventory', description: 'Adjust stock levels' },
  { code: 'raw-materials.view', name: 'View Raw Materials', description: 'View coffee shop ingredients stock' },
  { code: 'raw-materials.create', name: 'Create Raw Materials', description: 'Create ingredients' },
  { code: 'raw-materials.update', name: 'Update Raw Materials', description: 'Edit ingredients and stock' },
  { code: 'raw-materials.delete', name: 'Delete Raw Materials', description: 'Delete ingredients' },
  { code: 'units.view', name: 'View Units', description: 'View units of measure' },
  { code: 'units.create', name: 'Create Units', description: 'Create units of measure' },
  { code: 'units.update', name: 'Update Units', description: 'Edit units of measure' },
  { code: 'units.delete', name: 'Delete Units', description: 'Delete units of measure' },
  { code: 'transactions.view', name: 'View Transactions', description: 'View transactions' },
  { code: 'transactions.create', name: 'Create Transactions', description: 'Create sales' },
  { code: 'transactions.update', name: 'Update Transactions', description: 'Edit transactions' },
  { code: 'transactions.delete', name: 'Delete Transactions', description: 'Delete transactions' },
  { code: 'sales-items.view', name: 'View Sales Items', description: 'View sales items report' },
  { code: 'expenses.view', name: 'View Expenses', description: 'View expenses' },
  { code: 'expenses.create', name: 'Create Expenses', description: 'Create expenses' },
  { code: 'expenses.update', name: 'Update Expenses', description: 'Edit expenses' },
  { code: 'expenses.delete', name: 'Delete Expenses', description: 'Delete expenses' },
  { code: 'salary.view', name: 'View Salary', description: 'View salary module' },
  { code: 'salary.create', name: 'Create Salary', description: 'Create salary records' },
  { code: 'salary.update', name: 'Update Salary', description: 'Edit salary' },
  { code: 'salary.delete', name: 'Delete Salary', description: 'Delete salary' },
  { code: 'reports.view', name: 'View Reports', description: 'View reports' },
  { code: 'users.view', name: 'View Users', description: 'View users list' },
  { code: 'users.create', name: 'Create Users', description: 'Create users' },
  { code: 'users.update', name: 'Update Users', description: 'Edit users and roles' },
  { code: 'users.delete', name: 'Delete Users', description: 'Delete users' },
  { code: 'reconciliation.view', name: 'View Reconciliation', description: 'View reconciliation' },
  { code: 'reconciliation.close', name: 'Close Day', description: 'Close day reconciliation' },
  { code: 'starting-cash.view', name: 'View Starting Cash', description: 'View starting cash' },
  { code: 'starting-cash.create', name: 'Create Starting Cash', description: 'Record starting cash' },
  { code: 'starting-cash.update', name: 'Update Starting Cash', description: 'Edit starting cash' },
  { code: 'starting-cash.delete', name: 'Delete Starting Cash', description: 'Delete starting cash' },
  { code: 'employees.view', name: 'View Employees', description: 'View employees' },
  { code: 'employees.create', name: 'Create Employees', description: 'Create employees' },
  { code: 'employees.update', name: 'Update Employees', description: 'Edit employees' },
  { code: 'employees.delete', name: 'Delete Employees', description: 'Delete employees' },
  { code: 'rbac.view', name: 'View RBAC', description: 'View roles and permissions' },
  { code: 'rbac.manage', name: 'Manage RBAC', description: 'Create and edit roles and permissions' },
];

const CASHIER_PERMISSION_CODES = [
  'dashboard.view', 'pos.use', 'products.view', 'categories.view',
  'inventory.view', 'inventory.adjust',
  'raw-materials.view', 'raw-materials.create', 'raw-materials.update', 'raw-materials.delete',
  'units.view', 'units.create', 'units.update', 'units.delete',
  'transactions.view', 'transactions.create',
  'sales-items.view', 'expenses.view', 'expenses.create', 'expenses.update', 'expenses.delete',
  'reports.view', 'reconciliation.view', 'reconciliation.close',
  'starting-cash.view', 'starting-cash.create', 'starting-cash.update', 'starting-cash.delete',
];

async function ensureRoleIdColumn() {
  const qi = sequelize.getQueryInterface();
  const tableDesc = await qi.describeTable('Users');
  const hasRoleId = Object.keys(tableDesc).some((k) => k.toLowerCase() === 'roleid');
  if (hasRoleId) return;
  await sequelize.query(
    'ALTER TABLE "Users" ADD COLUMN "roleId" INTEGER REFERENCES "Roles"("id");',
    { raw: true }
  );
  console.log('RBAC seed: added roleId column to Users table');
}

/** Upsert permission rows so new codes added in code deploy to existing databases. */
async function ensurePermissionRows() {
  for (const p of DEFAULT_PERMISSIONS) {
    const [row, created] = await Permission.findOrCreate({
      where: { code: p.code },
      defaults: { name: p.name, description: p.description },
    });
    if (!created && (row.name !== p.name || row.description !== p.description)) {
      await row.update({ name: p.name, description: p.description });
    }
  }
}

/**
 * Keeps Permission rows and Admin/Cashier roles aligned with DEFAULT_PERMISSIONS / CASHIER_PERMISSION_CODES.
 * Safe to run on every server start (idempotent).
 */
async function syncRolesAndPermissions({ verbose = false } = {}) {
  const perms = await Permission.findAll();
  if (perms.length === 0) {
    await Permission.bulkCreate(DEFAULT_PERMISSIONS);
    if (verbose) console.log('RBAC seed: created default permissions');
  } else {
    await ensurePermissionRows();
    if (verbose) console.log('RBAC seed: ensured permission rows are up to date');
  }

  let adminRole = await Role.findOne({ where: { name: 'Admin' } });
  if (!adminRole) {
    adminRole = await Role.create({ name: 'Admin', description: 'Full access' });
    const allPerms = await Permission.findAll();
    await adminRole.setPermissions(allPerms);
    if (verbose) console.log('RBAC seed: created Admin role with all permissions');
  } else {
    const allPerms = await Permission.findAll();
    await adminRole.setPermissions(allPerms);
  }

  let cashierRole = await Role.findOne({ where: { name: 'Cashier' } });
  if (!cashierRole) {
    cashierRole = await Role.create({ name: 'Cashier', description: 'POS and basic operations' });
    const cashierPerms = await Permission.findAll({ where: { code: CASHIER_PERMISSION_CODES } });
    await cashierRole.setPermissions(cashierPerms);
    if (verbose) console.log('RBAC seed: created Cashier role');
  } else {
    const cashierPerms = await Permission.findAll({ where: { code: CASHIER_PERMISSION_CODES } });
    const existing = await cashierRole.getPermissions();
    const existingIds = new Set(existing.map((p) => p.id));
    const toAdd = cashierPerms.filter((p) => !existingIds.has(p.id));
    if (toAdd.length) {
      await cashierRole.addPermissions(toAdd);
      if (verbose) console.log('RBAC seed: added', toAdd.length, 'permission(s) to Cashier role');
    }
  }

  return { adminRole, cashierRole };
}

async function runRbacSeed() {
  const { adminRole, cashierRole } = await syncRolesAndPermissions({ verbose: true });

  // Ensure Users table has roleId column (migration for existing DBs)
  await ensureRoleIdColumn();

  // Migrate existing users: set roleId from legacy role if not set
  const users = await User.findAll({ where: { roleId: null }, include: [{ model: Role, as: 'roleRef', required: false }] });
  for (const u of users) {
    if (u.role === 'admin' && adminRole) {
      await u.update({ roleId: adminRole.id });
    } else if ((u.role === 'cashier' || !u.role) && cashierRole) {
      await u.update({ roleId: cashierRole.id });
    }
  }
  if (users.length > 0) console.log('RBAC seed: migrated', users.length, 'users to roleId');
}

module.exports = {
  runRbacSeed,
  syncRolesAndPermissions,
  DEFAULT_PERMISSIONS,
  CASHIER_PERMISSION_CODES,
};
