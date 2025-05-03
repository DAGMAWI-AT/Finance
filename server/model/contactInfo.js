const { pool } = require('../config/db');

const contactInfoTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS contact_content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_title VARCHAR(255) NOT NULL,
      description TEXT,
      email TEXT,   -- Store email as a JSON string
      phone TEXT,   -- Store phone as a JSON string
      location VARCHAR(255),
      address VARCHAR(255),
      map_embed_url TEXT,
      image_url TEXT,
      facebook_link TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    const [rows] = await pool.query(query);
    console.log("✅ contactInfo table created or already exists.");
  } catch (error) {
    console.error("❌ Failed to create contactInfo table:", error);
  }
};

// module.exports = contactInfoTable;
module.exports = { contactInfoTable};