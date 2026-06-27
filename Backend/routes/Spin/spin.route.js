const express = require("express");
const { getSpinStatus, claimReward } = require("./spin.controller");

const router = express.Router();

router.get("/status/:userId", getSpinStatus);
router.post("/claim", claimReward);

module.exports = router;
