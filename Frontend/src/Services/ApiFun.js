import axios from "axios";
import { baseUrl, createGameApi, gameState, movePawnApi, rollDice } from "./api";
import { logger } from "../Util/logger";

const toApiError = (err) => err.response?.data || { message: "Network error" };

export const fetchGameState = async (gameId) => {
  try {
    const res = await axios.get(`${gameState}/${gameId}/state`);
    return res.data;
  } catch (err) {
    logger.error("Failed to fetch game state:", err);
    throw toApiError(err);
  }
};

export const createGame = async (players, maxPlayers) => {
  try {
    const res = await axios.post(createGameApi, { players, maxPlayers });
    return res.data.gameId;
  } catch (err) {
    logger.error("Failed to create game:", err);
    throw toApiError(err);
  }
};

export const rollDiceFun = async (gameId) => {
  try {
    const res = await axios.post(`${rollDice}/${gameId}/roll`);
    return res.data;
  } catch (err) {
    logger.error("Failed to roll dice:", err);
    throw toApiError(err);
  }
};

export const movePawnFun = async (gameId, pawnId) => {
  try {
    const res = await axios.post(movePawnApi, { gameId, pawnId });
    return res.data;
  } catch (err) {
    logger.error("Failed to move pawn:", err);
    throw toApiError(err);
  }
};

export const signupFun = async (username, email, password) => {
  try {
    const res = await axios.post(`${baseUrl}/users/signup`, { username, email, password });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const loginFun = async (email, password) => {
  try {
    const res = await axios.post(`${baseUrl}/users/login`, { email, password });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const signinWithNumberFun = async (phone, username) => {
  try {
    const res = await axios.post(`${baseUrl}/users/signin-number`, { phone, username });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const googleAuthFun = async (token) => {
  try {
    const res = await axios.post(`${baseUrl}/users/google-auth`, { token });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const fetchProfileFun = async (userId) => {
  try {
    const res = await axios.get(`${baseUrl}/users/profile/${userId}`);
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const fetchLeaderboardFun = async () => {
  try {
    const res = await axios.get(`${baseUrl}/users/leaderboard`);
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const deductCoinsFun = async (userId, amount) => {
  try {
    const res = await axios.post(`${baseUrl}/users/deduct-coins`, { userId, amount });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const rewardCoinsFun = async (userId, amount) => {
  try {
    const res = await axios.post(`${baseUrl}/users/reward-coins`, { userId, amount });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const redeemCoinsFun = async (userId, coins, usd) => {
  try {
    const res = await axios.post(`${baseUrl}/users/redeem`, { userId, coins, usd });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const fetchRedeemHistoryFun = async (userId) => {
  try {
    const res = await axios.get(`${baseUrl}/users/redeem-history/${userId}`);
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};
