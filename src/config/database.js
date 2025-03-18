const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

const connectToDatabase = async () => {
  await mongoose.connect(MONGO_URI);
};

module.exports = connectToDatabase;
