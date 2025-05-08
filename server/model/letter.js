const { pool } = require('../config/db');
const fs = require('fs');

async function createLettersTable() {
    try {
            // await pool.query(`DROP TABLE IF EXISTS letters`);

        const query = `
CREATE TABLE IF NOT EXISTS letters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    type ENUM('Meeting', 'Announcement', 'Warning') NOT NULL,
    attachment_path VARCHAR(255),
    attachment_name VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attachment_mimetype VARCHAR(100),
    send_to_all BOOLEAN NOT NULL,
    selected_csos JSON,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;
        await pool.query(query);
        // console.log("Letters table created or already exists");
    } catch (error) {
        console.error("Error creating letters table:", error);
        throw error;
    }
}

module.exports = { createLettersTable };


