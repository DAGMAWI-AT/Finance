const { pool } = require("../config/db");

async function createHeroSlidesTable() {
  try {
    // await pool.query(`DROP TABLE IF EXISTS hero_slides`);
    const query = `
      CREATE TABLE hero_slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    // console.log("✅ hero_slides table created.");
  } catch (err) {
    console.error("❌ Error creating hero_slides table:", err);
  }
}

module.exports = { createHeroSlidesTable };
