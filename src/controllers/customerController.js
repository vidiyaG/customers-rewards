const { body, validationResult } = require("express-validator");
const Customer = require("../models/customer");
const mongoose = require("mongoose");

// Validation Middleware
const validateCustomer = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()?.[0],
      });
    }
    next();
  },
];

// Controller to Create a Customer
const createCustomer = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Save to MongoDB
    const customer = new Customer({ name, email });
    await customer.save();

    res
      .status(201)
      .json({ message: "Customer created successfully", customer });
  } catch (error) {
    console.error("Error saving customer:", error);
    if (error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({
        error: { msg: "Email already exists. Please use a different email." },
      });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required." });
    }

    //  Find Customer by ID
    const customer = await Customer.findById(customerId);

    //  Check if Customer Exists
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    //  Return Customer Data
    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();

    //  Check if Customer Exists
    if (!customers) {
      return res.status(404).json({ error: "Customers not found." });
    }

    //  Return Customer Data
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

const customerExists = async (req, res, next) => {
  try {
    let { customerId } = req.body;
    if (!customerId) {
      customerId = req.params?.customerId;
    }
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }

    const existingCustomer = await Customer.findById(customerId);

    if (!existingCustomer) {
      return res.status(404).json({
        error: "Customer not found.",
      });
    }
    next();
  } catch (error) {
    console.error("Error saving Transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Export Controller and Middleware
module.exports = {
  createCustomer,
  validateCustomer,
  getCustomerById,
  getCustomers,
  customerExists,
};
