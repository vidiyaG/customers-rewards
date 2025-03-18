const { calculateRewardPoints } = require("../src/utils/rewardCalculator");

test("should return 90 points for a $120 purchase", () => {
  const points = calculateRewardPoints(120);
  expect(points).toBe(90);
});

test("should return 50 points for a $100 purchase", () => {
  const points = calculateRewardPoints(100);
  expect(points).toBe(50);
});

test("should return 0 points for a $49 purchase", () => {
  const points = calculateRewardPoints(49);
  expect(points).toBe(0);
});
