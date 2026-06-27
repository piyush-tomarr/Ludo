const { pool } = require("../../db/connection");

const db = () => pool.promise();


const findUserIdByEmail = async (email) => {
  const [rows] = await db().execute(process.env.GET_USER_ID_BY_EMAIL, [email]);
  return rows;
};

const createUser = async (username, email, hashedPassword) => {
  const [result] = await db().execute(process.env.INSERT_USER, [username, email, hashedPassword]);
  return result.insertId;
};

const findUserByEmail = async (email) => {
  const [users] = await db().execute(process.env.GET_USER_BY_EMAIL, [email]);
  return users;
};

const findUserByPhone = async (phone) => {
  const [users] = await db().execute(process.env.GET_USER_BY_PHONE, [phone]);
  return users;
};

const updateUsername = async (userId, username) => {
  await db().execute(process.env.UPDATE_USERNAME_BY_ID, [username.trim(), userId]);
};

const createUserByPhone = async (username, phone, coins = 5000) => {
  const [result] = await db().execute(process.env.INSERT_USER_BY_PHONE, [username, phone, coins]);
  return result.insertId;
};

const findUserByGoogleOrEmail = async (googleId, email) => {
  const [users] = await db().execute(process.env.GET_USER_BY_GOOGLE_OR_EMAIL, [googleId, email]);
  return users;
};

const updateGoogleUser = async (googleId, avatar, userId) => {
  await db().execute(process.env.UPDATE_GOOGLE_USER, [googleId, avatar, userId]);
};

const createGoogleUser = async (username, email, googleId, avatar) => {
  const [result] = await db().execute(process.env.INSERT_GOOGLE_USER, [username, email, googleId, avatar]);
  return result.insertId;
};

const getUserProfile = async (userId) => {
  const [users] = await db().execute(process.env.GET_USER_PROFILE, [userId]);
  return users[0];
};

const getLeaderboard = async () => {
  const [topPlayers] = await db().execute(process.env.GET_LEADERBOARD);
  return topPlayers;
};

const getUserCoins = async (userId) => {
  const [users] = await db().execute(process.env.GET_USER_COINS, [userId]);
  return users[0]?.coins;
};

const deductCoins = async (userId, amount) => {
  await db().execute(process.env.DEDUCT_COINS, [amount, userId]);
};

const findUserIdById = async (userId) => {
  const [users] = await db().execute(process.env.GET_USER_ID_BY_ID, [userId]);
  return users;
};

const rewardCoins = async (userId, amount) => {
  await db().execute(process.env.REWARD_COINS, [amount, userId]);
};

const createRedeemLog = async (userId, coins, usd) => {
  await db().execute(process.env.INSERT_REDEEM_LOG, [userId, coins, usd]);
};

const getRedeemHistory = async (userId) => {
  const [history] = await db().execute(process.env.GET_REDEEM_HISTORY, [userId]);
  return history;
};

const usernameUpdate = async (id, username) => {
  await db().execute(process.env.UPDATE_USERNAME, [username, id]);
};

const avatarUpdate = async (id, avatarPath) => {
  await db().execute(process.env.UPDATE_AVATAR, [avatarPath, id]);
};

const updateGender = async (id, gender) => {
  await db().execute(process.env.UPDATE_GENDER, [gender, id]);
};

module.exports = {
  updateGender,
  usernameUpdate,
  avatarUpdate,
  findUserIdByEmail,
  createUser,
  findUserByEmail,
  findUserByPhone,
  updateUsername,
  createUserByPhone,
  findUserByGoogleOrEmail,
  updateGoogleUser,
  createGoogleUser,
  getUserProfile,
  getLeaderboard,
  getUserCoins,
  deductCoins,
  findUserIdById,
  rewardCoins,
  createRedeemLog,
  getRedeemHistory
};
