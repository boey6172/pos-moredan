var DataTypes = require("sequelize").DataTypes;
var _category = require("./category");
var _customer = require("./customer");
var _employeeshift = require("./employeeshift");
var _inventorytransaction = require("./inventorytransaction");
var _payment = require("./payment");
var _product = require("./product");
var _sale = require("./sale");
var _saleitem = require("./saleitem");
var _sequelizemeta = require("./sequelizemeta");
var _user = require("./user");

function initModels(sequelize) {
  var category = _category(sequelize, DataTypes);
  var customer = _customer(sequelize, DataTypes);
  var employeeshift = _employeeshift(sequelize, DataTypes);
  var inventorytransaction = _inventorytransaction(sequelize, DataTypes);
  var payment = _payment(sequelize, DataTypes);
  var product = _product(sequelize, DataTypes);
  var sale = _sale(sequelize, DataTypes);
  var saleitem = _saleitem(sequelize, DataTypes);
  var sequelizemeta = _sequelizemeta(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  product.belongsTo(category, { as: "Category", foreignKey: "CategoryID"});
  category.hasMany(product, { as: "products", foreignKey: "CategoryID"});
  sale.belongsTo(customer, { as: "Customer", foreignKey: "CustomerID"});
  customer.hasMany(sale, { as: "sales", foreignKey: "CustomerID"});
  inventorytransaction.belongsTo(product, { as: "Product", foreignKey: "ProductID"});
  product.hasMany(inventorytransaction, { as: "inventorytransactions", foreignKey: "ProductID"});
  saleitem.belongsTo(product, { as: "Product", foreignKey: "ProductID"});
  product.hasMany(saleitem, { as: "saleitems", foreignKey: "ProductID"});
  payment.belongsTo(sale, { as: "Sale", foreignKey: "SaleID"});
  sale.hasMany(payment, { as: "payments", foreignKey: "SaleID"});
  saleitem.belongsTo(sale, { as: "Sale", foreignKey: "SaleID"});
  sale.hasMany(saleitem, { as: "saleitems", foreignKey: "SaleID"});
  employeeshift.belongsTo(user, { as: "User", foreignKey: "UserID"});
  user.hasMany(employeeshift, { as: "employeeshifts", foreignKey: "UserID"});
  sale.belongsTo(user, { as: "User", foreignKey: "UserID"});
  user.hasMany(sale, { as: "sales", foreignKey: "UserID"});

  return {
    category,
    customer,
    employeeshift,
    inventorytransaction,
    payment,
    product,
    sale,
    saleitem,
    sequelizemeta,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
