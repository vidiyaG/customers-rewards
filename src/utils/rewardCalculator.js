const calculateRewardPoints = (amount) => {
  let points = 0;
  if (amount > 100) {
    points += Math.floor(amount - 100) * 2; // 2 points per $ above 100
    amount = 100; // Reduce amount to 100
  }

  if (amount > 50) {
    points += Math.floor(amount - 50) * 1; // 1 point per $ between 50-100
  }

  return points; // Always return integer points
};

module.exports = { calculateRewardPoints };
