const app = require("../src/index"); // Import your Express app
const mongoose = require("mongoose");

// Close the server and database connection after all tests
afterAll(async () => {
  if (global.server) {
    global.server.close(() => console.log("Test server closed"));
  }
  await mongoose.connection.close();
});
