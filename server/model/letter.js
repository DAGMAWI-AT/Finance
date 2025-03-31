const { pool } = require('../config/db');
const fs = require('fs');

async function createLettersTable() {
    try {
        const query = `
CREATE TABLE IF NOT EXISTS letters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    type ENUM('Meeting', 'Announcement', 'Warning') NOT NULL,
    attachment_path VARCHAR(255),
    attachment_name VARCHAR(255),
    attachment_mimetype VARCHAR(100),
    send_to_all BOOLEAN DEFAULT FALSE,
    selected_csos JSON,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;
        await pool.query(query);
        console.log("Letters table created or already exists");
    } catch (error) {
        console.error("Error creating letters table:", error);
        throw error;
    }
}

module.exports = { createLettersTable };


// const { pool } = require('../config/db'); // Assuming your Sequelize instance is in this file

// // Raw SQL query to create the 'Letters' table
// async function createLettersTable() {
//     try {
//         const query =  `
// CREATE TABLE IF NOT EXISTS letters (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     title VARCHAR(255) NOT NULL,
//     content TEXT NOT NULL,
//     type ENUM('Meeting', 'Announcement', 'Other') NOT NULL,
//     attachment VARCHAR(255),
//     createdBy INT NOT NULL,
//     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (createdBy) REFERENCES staff(id)
//        )`;
//         await pool.query(query);
//     } catch (error) {
//         console.errosr("Error creating staff table:", error);
//         throw error;
//     }
// }


// // Execute the query to create the table

// module.exports = {Letter:"letters", createLettersTable}
