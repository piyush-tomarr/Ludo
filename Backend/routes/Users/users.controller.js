const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const sharp = require("sharp");
const path = require("path");

const asyncHandler = require("../../utils/asyncHandler");
const { badRequest, notFound, unauthorized } = require("../../utils/http");
const userService = require("./users.service");

const client = new OAuth2Client(process.env.CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "ludo_master_secret_key_123";
const DEFAULT_PHONE_SIGNIN_COINS = 5000;
const PRESET_AVATARS = new Set(["avatar1", "avatar2", "avatar3", "avatar4", "avatar5", "avatar6"]);

const signToken = (payload, expiresIn = "7d") => jwt.sign(payload, JWT_SECRET, { expiresIn });
const isBlank = (value) => !value || String(value).trim() === "";
const toNumber = (value) => Number(value);

const buildAuthResponse = (message, token, user) => ({
  message,
  token,
  user
});

const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (isBlank(username) || isBlank(email) || isBlank(password)) {
    throw badRequest("Please fill all fields");
  }

  const existing = await userService.findUserIdByEmail(email);
  if (existing.length > 0) {
    throw badRequest("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await userService.createUser(username.trim(), email.trim(), hashedPassword);
  const token = signToken({ id: userId, email: email.trim() });

  res.status(201).json(buildAuthResponse("User created successfully", token, {
    id: userId,
    username: username.trim(),
    email: email.trim()
  }));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (isBlank(email) || isBlank(password)) {
    throw badRequest("Please enter email and password");
  }

  const users = await userService.findUserByEmail(email.trim());
  const user = users[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw badRequest("Invalid credentials");
  }

  const token = signToken({ id: user.id, email: user.email });
  res.json(buildAuthResponse("Login successful", token, {
    id: user.id,
    username: user.username,
    email: user.email
  }));
});

const signinNumber = asyncHandler(async (req, res) => {
  const { phone, username } = req.body;

  if (isBlank(phone)) {
    throw badRequest("Please enter a number");
  }

  const normalizedPhone = String(phone).trim();
  const existing = await userService.findUserByPhone(normalizedPhone);
  let user = existing[0];
  let isNewUser = false;

  if (user) {
    const trimmedUsername = username?.trim();
    if (trimmedUsername && trimmedUsername !== user.username) {
      await userService.updateUsername(user.id, trimmedUsername);
      user.username = trimmedUsername;
    }
  } else {
    const finalUsername = username?.trim() || `Player_${normalizedPhone.slice(-4)}`;
    const userId = await userService.createUserByPhone(finalUsername, normalizedPhone, DEFAULT_PHONE_SIGNIN_COINS);
    user = { id: userId, username: finalUsername, phone: normalizedPhone, coins: DEFAULT_PHONE_SIGNIN_COINS };
    isNewUser = true;
  }

  const token = signToken({ id: user.id, phone: user.phone }, "30d");
  res.json(buildAuthResponse(isNewUser ? "Account created successfully" : "Login successful", token, {
    id: user.id,
    username: user.username,
    phone: user.phone,
    avatar: user.avatar,
    coins: user.coins,
    gender: user.gender || "male"
  }));
});

const googleAuth = asyncHandler(async (req, res) => {
  const { token: googleToken } = req.body;

  if (isBlank(googleToken)) {
    throw badRequest("Google token is required");
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.CLIENT_ID
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw unauthorized("Invalid Google token");
  }

  const { sub: googleId, email, name, picture: avatar } = payload;
  const existing = await userService.findUserByGoogleOrEmail(googleId, email);
  let user = existing[0];

  if (user) {
    if (!user.google_id) {
      await userService.updateGoogleUser(googleId, avatar, user.id);
      user.google_id = googleId;
      user.avatar = avatar;
    }
  } else {
    const userId = await userService.createGoogleUser(name, email, googleId, avatar);
    user = { id: userId, username: name, email, avatar };
  }

  const token = signToken({ id: user.id, email: user.email });
  res.json(buildAuthResponse(existing.length === 0 ? "Account created successfully" : "Login successful", token, {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar
  }));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.params.userId);
  if (!user) throw notFound("User not found");

  res.json({ user });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await userService.getLeaderboard();
  res.json({ leaderboard });
});

const deductCoins = asyncHandler(async (req, res) => {
  const { userId, amount } = req.body;
  const coinAmount = toNumber(amount);

  if (!userId || !coinAmount || coinAmount <= 0) {
    throw badRequest("UserId and positive amount required");
  }

  const currentCoins = await userService.getUserCoins(userId);
  if (currentCoins === undefined) throw notFound("User not found");
  if (currentCoins < coinAmount) throw badRequest("Insufficient coins");

  await userService.deductCoins(userId, coinAmount);
  res.json({ message: "Coins deducted successfully", remaining: currentCoins - coinAmount });
});

const rewardCoins = asyncHandler(async (req, res) => {
  const { userId, amount } = req.body;
  const coinAmount = toNumber(amount);

  if (!userId || !coinAmount || coinAmount <= 0) {
    throw badRequest("UserId and positive amount required");
  }

  const users = await userService.findUserIdById(userId);
  if (users.length === 0) throw notFound("User not found");

  await userService.rewardCoins(userId, coinAmount);
  res.json({ message: "Coins rewarded successfully" });
});

const redeem = asyncHandler(async (req, res) => {
  const { userId, coins, usd } = req.body;
  const coinAmount = toNumber(coins);
  const usdAmount = toNumber(usd);

  if (!userId || !coinAmount || !usdAmount || coinAmount <= 0 || usdAmount <= 0) {
    throw badRequest("UserId, coins, and usd amount required");
  }

  const currentCoins = await userService.getUserCoins(userId);
  if (currentCoins === undefined) throw notFound("User not found");
  if (currentCoins < coinAmount) throw badRequest("Insufficient coins");

  await userService.deductCoins(userId, coinAmount);
  await userService.createRedeemLog(userId, coinAmount, usdAmount);

  res.json({
    message: "Redemption request submitted successfully",
    remainingCoins: currentCoins - coinAmount
  });
});

const getRedeemHistory = asyncHandler(async (req, res) => {
  const history = await userService.getRedeemHistory(req.params.userId);
  res.json({ history });
});

const editProfile = asyncHandler(async (req, res) => {
  const { id, username, gender } = req.body;
  const avatarFile = req.file;

  if (!id) throw badRequest("User ID required");
  if (isBlank(username) && !avatarFile && isBlank(gender)) {
    throw badRequest("Nothing to update");
  }

  if (!isBlank(username)) {
    await userService.usernameUpdate(id, username.trim());
  }

  if (!isBlank(gender)) {
    await userService.updateGender(id, gender.trim());
  }

  if (avatarFile) {
    // Preset avatars keep stable file names; custom uploads get unique names.
    const originalName = path.parse(avatarFile.originalname).name;
    const filename = PRESET_AVATARS.has(originalName)
      ? `${originalName}.webp`
      : `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(__dirname, "../../public/images", filename);

    await sharp(avatarFile.buffer)
      .resize(200, 200)
      .webp({ quality: 80 })
      .toFile(outputPath);

    await userService.avatarUpdate(id, `/images/${filename}`);
  }

  res.status(200).json({ message: "Profile updated successfully" });
});

module.exports = {
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
};
