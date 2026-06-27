const express = require("express");
const uploadAvatar = require("../../middlewares/uploadAvatar");
const {
  signup,
  login,
  signinNumber,
  googleAuth,
  getProfile,
  getLeaderboard,
  deductCoins,
  rewardCoins,
  redeem,
  getRedeemHistory,
  editProfile
} = require("./users.controller");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/signin-number", signinNumber);
router.post("/google-auth", googleAuth);
router.get("/profile/:userId", getProfile);
router.get("/leaderboard", getLeaderboard);
router.post("/deduct-coins", deductCoins);
router.post("/reward-coins", rewardCoins);
router.post("/redeem", redeem);
router.get("/redeem-history/:userId", getRedeemHistory);
router.post("/edit-profile", uploadAvatar.single("avatar"), editProfile);

module.exports = router;
