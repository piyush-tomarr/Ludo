const { pool } = require("../../db/connection");
const { badRequest } = require("../../utils/http");

const getSpinStatus = async (userId) => {
  const [rows] = await pool.promise().execute(process.env.GET_DAILY_SPIN, [userId]);
  return rows;
};

const claimSpinReward = async (userId, rewardType = "coins", rewardAmount = 0) => {
  const [existing] = await pool.promise().execute(process.env.GET_DAILY_SPIN, [userId]);

  if (existing.length > 0) {
    throw badRequest("You have already spun the wheel today!");
  }

  const connection = await pool.promise().getConnection();
  await connection.beginTransaction();

  try {
    // Record the spin first so reward claiming is auditable.
    await connection.execute(process.env.INSERT_DAILY_SPIN, [userId, rewardType, rewardAmount]);

    if (rewardAmount > 0) {
      await connection.execute(process.env.ADD_COINS_BY_ID, [rewardAmount, userId]);
    }

    await connection.commit();
    return { rewardAmount };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  getSpinStatus,
  claimSpinReward
};
