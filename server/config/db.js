// config/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// const pool = mysql.createPool({
//   host: "mysql-db03.remote",
//   port: 33636, // Specify the custom port here
//   user: "bishoftucso",
//   password: "bishoftucso", // Replace with actual password
//   database: "bishoft2_",          // Replace with actual database name
//   waitForConnections: true,
//   queueLimit: 0,
//   connectTimeout: 10000 // 10 seconds
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