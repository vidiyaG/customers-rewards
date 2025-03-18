const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../src/index"); // Import your Express app
const Transaction = require("../src/models/transaction");
const Customer = require("../src/models/customer");
const { calculateRewardPoints } = require("../src/utils/rewardCalculator");

jest.setTimeout(10000);

describe("Customer Rewards API", () => {
  let customerId;

  beforeAll(async () => {
    // Create a test customer
    const customer = await Customer.create({
      name: "John Doe",
      email: "john@example.com",
    });
    customerId = customer._id;
  });

  afterEach(async () => {
    // Cleanup transactions after each test
    await Transaction.deleteMany({ customerId });
  });

  afterAll(async () => {
    if (customerId) {
      await Customer.findByIdAndDelete(customerId); // Correct method
    }
    await mongoose.connection.close();
  });

  it("should return total reward points for a customer", async () => {
    // Creating transactions individually
    const transactions = [{ amount: 120 }, { amount: 80 }, { amount: 50 }];

    for (let tx of transactions) {
      await Transaction.create({
        customerId,
        amount: tx.amount,
        rewardPoints: calculateRewardPoints(tx.amount), // Use existing function
      });
    }

    const response = await request(app)
      .get(`/transactions/${customerId}/rewards`)
      .expect(200);

    expect(response.body).toHaveProperty("totalPoints");
    expect(response.body.totalPoints).toBe(120); // 90 + 30 + 0
  });

  it("should return zero reward points if no transactions exist", async () => {
    const response = await request(app)
      .get(`/transactions/${customerId}/rewards`)
      .expect(200);

    expect(response.body.totalPoints).toBe(0);
  });
});
