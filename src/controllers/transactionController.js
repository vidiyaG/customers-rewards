const { body, validationResult } = require("express-validator");
const Transaction = require("../models/transaction");
const Customer = require("../models/customer");
const { calculateRewardPoints } = require("../utils/rewardCalculator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// Validation Middleware
const validateTransaction = [
  body("customerId")
    .notEmpty()
    .withMessage("Customer ID is required")
    .isString()
    .withMessage("Customer ID must be a string"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")

    .custom((value) => {
      if (typeof value !== "number" || isNaN(value)) {
        return false; // Reject if not a number
      }
      // Convert value to string and check decimal places
      const decimalPlaces = value.toString().split(".")[1]?.length || 0;
      return decimalPlaces <= 2;
    })
    .withMessage("Amount must be a positive number with up to 2 decimal places")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()?.[0] });
    }
    next();
  },
];

// Controller to Create a Transaction

const createTransaction = async (req, res) => {
  try {
    const { customerId, amount } = req.body;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID format" });
    }

    const existingCustomer = await Customer.findById(customerId);

    if (!existingCustomer) {
      return res.status(404).json({
        error: "Customer not found. Please provide a valid customer ID.",
      });
    }
    const rewardPoints = calculateRewardPoints(amount);
    const transaction = new Transaction({ customerId, amount, rewardPoints });
    await transaction.save();

    res.status(201).json({ message: "Transaction saved", transaction });
  } catch (error) {
    console.error("Error saving Transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCustomerRewards = async (req, res) => {
  const { customerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ error: "Invalid customer ID format" });
  }

  const rewards = await Transaction.aggregate([
    {
      $match: { customerId: new ObjectId(customerId) }, // Ensure customerId is ObjectId
    },
    {
      $group: {
        _id: {
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // Extract YYYY-MM
        },
        totalPoints: { $sum: "$rewardPoints" }, // Sum reward points
      },
    },
    { $sort: { "_id.month": 1 } }, // Sort by month
    {
      $project: {
        _id: 0, // Remove _id field
        month: "$_id.month",
        totalPoints: 1,
      },
    },
  ]);
  let rewardsByMonth = {};
  let totalPoints = 0;

  rewards.forEach(({ month, totalPoints: points }) => {
    rewardsByMonth[month] = points;
    totalPoints += points;
  });

  res.json({ rewardsByMonth, totalPoints });
};

// Export Controller and Middleware
module.exports = { createTransaction, validateTransaction, getCustomerRewards };
