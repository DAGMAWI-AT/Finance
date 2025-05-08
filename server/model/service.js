const { pool } = require("../config/db");

async function createServiceTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      summary TEXT NOT NULL
    )
  `;

  try {
    await pool.query(query);
  } catch (error) {
    // console.error("❌ Error creating 'services' table:", error.message);
    console.error("❌ Error creating 'services' table:", error);
    throw error;
  }
}

module.exports = {
  createServiceTable,
};
