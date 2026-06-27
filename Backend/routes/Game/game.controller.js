const { getIO } = require("../../socket");
const asyncHandler = require("../../utils/asyncHandler");
const { badRequest } = require("../../utils/http");
const gameService = require("./game.service");

const createGame = asyncHandler(async (req, res) => {
  const { players, maxPlayers } = req.body;
  const { gameId, effectiveMaxPlayers } = await gameService.initializeGame(players, maxPlayers);

  getIO().emit("game_created", { gameId, maxPlayers: effectiveMaxPlayers });
  res.json({ gameId, maxPlayers: effectiveMaxPlayers });
});

const rollDice = asyncHandler(async (req, res) => {
  const result = await gameService.processDiceRoll(req.params.gameId, getIO(), req.body);
  res.json(result);
});

const getGameState = asyncHandler(async (req, res) => {
  const state = await gameService.fetchGameState(req.params.gameId);
  res.json(state);
});

const movePawn = asyncHandler(async (req, res) => {
  const { pawnId, gameId } = req.body;

  if (!pawnId || !gameId) {
    throw badRequest("gameId and pawnId are required");
  }

  const result = await gameService.processPawnMove(gameId, pawnId, getIO());
  res.json(result);
});

module.exports = {
  createGame,
  rollDice,
  getGameState,
  movePawn
};
