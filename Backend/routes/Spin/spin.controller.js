const asyncHandler = require("../../utils/asyncHandler");
const { badRequest } = require("../../utils/http");
const spinService = require("./spin.service");

const getSpinStatus = asyncHandler(async (req, res) => {
  const rows = await spinService.getSpinStatus(req.params.userId);

  if (rows.length > 0) {
    return res.json({ canSpin: false, lastSpin: rows[0] });
  }

  res.json({ canSpin: true });
});

const claimReward = asyncHandler(async (req, res) => {
  const { userId, rewardType, rewardAmount } = req.body;

  if (!userId) {
    throw badRequest("UserId is required");
  }

  const result = await spinService.claimSpinReward(userId, rewardType, Number(rewardAmount || 0));
  res.json({
    message: "Reward claimed successfully!",
    rewardAmount: result.rewardAmount
  });
});

module.exports = {
  getSpinStatus,
  claimReward
};
