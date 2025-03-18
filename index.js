require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectToDatabase = require("./config/database");

const customerRoutes = require("./routes/customerRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
app.use(express.json()); // Middleware to parse JSON

const PORT = process.env.PORT || 5000;

// MongoDB Connection

connectToDatabase()
  .then(() => {
    // console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use("/customers", customerRoutes);
app.use("/transactions", transactionRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack); // Logs the error stack
  res.status(500).json({ message: err.message || "Internal Server Error" });
});
