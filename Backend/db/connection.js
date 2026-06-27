const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  port: process.env.DB_PORT2,
  host: process.env.DB_HOST2,
  password: process.env.DB_PASS2,
  database: process.env.MYSQL_DB2,
  user: process.env.DB_USER2,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 100)
});

// Fail fast in logs when database credentials or network access are wrong.
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }

  connection.release();
  console.log("Database connected");
});

module.exports = { pool };
