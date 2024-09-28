const initQueries = require("./initQueries");
const orderQueries = require("./orderQueries");
const productQueries = require("./productQueries");
const tagQueries = require("./tagQueries");
const userQueries = require("./userQueries");
const vendorRequestQueries = require("./vendorRequestQueries");
const warehouseQueries = require("./warehouseQueries");

module.exports = {
  ...initQueries,
  ...orderQueries,
  ...productQueries,
  ...tagQueries,
  ...userQueries,
  ...vendorRequestQueries,
  ...warehouseQueries,
};
