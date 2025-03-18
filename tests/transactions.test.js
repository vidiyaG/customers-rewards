const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index"); // Import your Express app
const Customer = require("../src/models/customer");
const Transaction = require("../src/models/transaction");

jest.setTimeout(10000);

describe("Transactions API Tests", () => {
  let customerId;

  // Setup: Connect to the test DB and create a test customer
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const customer = await Customer.create({
      name: "Test User",
      email: "testuser@example.com",
    });

    customerId = customer._id;
  });

  afterEach(async () => {
    // Cleanup transactions after each test
    if (customerId) {
      await Transaction.deleteMany({ customerId });
    }
  });
  // Cleanup: Delete test data and close DB connection
  afterAll(async () => {
    if (customerId) {
      await Customer.findByIdAndDelete(customerId); // Correct method
    }
    await mongoose.connection.close();
  });

  it("should create a transaction and return correct reward points", async () => {
    const response = await request(app)
      .post("/transactions/create")
      .send({
        customerId,
        amount: 120,
      })
      .expect(201);

    // Check if response has the 'transaction' object
    expect(response.body).toHaveProperty("transaction");

    // Ensure 'transaction' has 'rewardPoints'
    expect(response.body.transaction).toHaveProperty("rewardPoints");

    // Check the reward points calculation
    expect(response.body.transaction.rewardPoints).toBe(90);
  });

  it("should return an error when amount is negative", async () => {
    const response = await request(app)
      .post("/transactions/create")
      .send({
        customerId, // Ensure this is a valid customer ID in your DB
        amount: -50,
      })
      .expect(400); // Expecting a Bad Request

    // Check if response contains the correct error message
    expect(response.body).toHaveProperty("error");
    expect(response.body.error.msg).toBe("Amount must be a positive number");
  });

  it("should return an error when amount has more than two decimal places", async () => {
    const response = await request(app)
      .post("/transactions/create")
      .send({
        customerId, // Ensure this is a valid customer ID in your DB
        amount: 100.123, // Invalid precision (more than 2 decimal places)
      })
      .expect(400); // Expecting a Bad Request

    // Check if response contains the correct error message
    expect(response.body).toHaveProperty("error");
    expect(response.body.error.msg).toBe(
      "Amount must be a positive number with up to 2 decimal places"
    );
  });

  it("should return an error if required fields are missing", async () => {
    const response = await request(app)
      .post("/transactions/create")
      .send({}) // Empty request body
      .expect(400);

    expect(response.body).toHaveProperty("error");
    //  expect(response.body.error.msg).toBe("customerId and amount are required");
  });

  it("should return an error for an invalid customerId", async () => {
    const response = await request(app)
      .post("/transactions/create")
      .send({
        customerId: "invalid123", // Non-MongoDB ObjectId
        amount: 100,
      })
      .expect(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Invalid customer ID format");
  });
});
