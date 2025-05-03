const { pool } = require("../config/db");

async function createAboutTable() {
  try {
    // await pool.query(`DROP TABLE IF EXISTS about_us`);
    
    const query = `
      CREATE TABLE about_us (
        id INT AUTO_INCREMENT PRIMARY KEY,
        introduction TEXT NOT NULL,
        mission TEXT NOT NULL,
        vision TEXT NOT NULL,
        purpose TEXT NOT NULL,
        core_values TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(query);
    console.log("✅ about_us table created successfully.");
  } catch (error) {
    console.error("❌ Error creating about_us table:", error);
    throw error;
  }
}

module.exports = { createAboutTable };
