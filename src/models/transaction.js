const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: { type: Number, required: true },
    rewardPoints: { type: Number, required: true }, // Store precomputed points
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
  },
);
transactionSchema.index({ customerId: 1 });
module.exports = mongoose.model("Transaction", transactionSchema);
