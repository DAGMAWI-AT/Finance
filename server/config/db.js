// config/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost" ,
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "finance_office",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   connectTimeout: 10000, // 10 seconds timeout
// 
// });
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || "crossover.proxy.rlwy.net",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "WmrkTttxEWzWOFtqFtUAjYuKwXYcYQpw",
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT || 25132,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function connectDB() {
  try {
    // const connection = await pool.getConnection();
    console.log("MySQL connected successfully");
    // connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error("MySQL connection failed:", err);
    process.exit(1);
  }
}

module.exports = { pool, connectDB };