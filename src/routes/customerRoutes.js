const express = require("express");
const {
  createCustomer,
  validateCustomer,
  getCustomerById,
  getCustomers,
} = require("../controllers/customerController");
const router = express.Router();

router.post("/create", validateCustomer, createCustomer);
router.get("/", getCustomers);
router.get("/:customerId", getCustomerById);

getCustomerById;

module.exports = router;
