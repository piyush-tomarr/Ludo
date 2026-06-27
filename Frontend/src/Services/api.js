const trimTrailingSlash = (url) => url.replace(/\/+$/, "");

const configuredApiUrl = import.meta.env.VITE_API_URL || "https://ethioludo.gameit.in";
const baseUrl = trimTrailingSlash(configuredApiUrl);
const baseUrl1 = baseUrl;

const rollDice = `${baseUrl}/game`;
const gameState = `${baseUrl}/game`;
const createGameApi = `${baseUrl}/game/create`;
const movePawnApi = `${baseUrl}/game/move`;
const authApi = `${baseUrl}/users`;
const spinApi = `${baseUrl}/spin`;

export {
  baseUrl,
  baseUrl1,
  rollDice,
  gameState,
  createGameApi,
  movePawnApi,
  authApi,
  spinApi
};
