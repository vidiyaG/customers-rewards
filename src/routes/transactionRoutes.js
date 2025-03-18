const express = require("express");
const {
  createTransaction,
  validateTransaction,
  getCustomerRewards,
} = require("../controllers/transactionController");

const { customerExists } = require("../controllers/customerController");

const router = express.Router();

// Apply validation middleware before the controller
router.post("/create", validateTransaction, customerExists, createTransaction);
router.get("/:customerId/rewards", customerExists, getCustomerRewards);

module.exports = router;
