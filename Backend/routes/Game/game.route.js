const express = require("express");
const { createGame, rollDice, getGameState, movePawn } = require("./game.controller");

const router = express.Router();

router.post("/create", createGame);
router.post("/:gameId/roll", rollDice);
router.get("/:gameId/state", getGameState);
router.post("/move", movePawn);

module.exports = router;