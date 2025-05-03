//model/news

const { pool } = require("../config/db");
const fs = require("fs");

async function createNewsTable() {
  try {
    // await pool.query(`DROP TABLE IF EXISTS news`);
        const query = `
    CREATE TABLE news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image VARCHAR(255),
        author VARCHAR(100) NOT NULL,
        read_time VARCHAR(20),
        tag VARCHAR(50),
        quotes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )`;
        await pool.query(query);
      } catch (error) {
        console.error("Error creating form table:", error);
        throw error;
      }
    }

async function createNews_CommentsTable() {
  try {
    // await pool.query(`DROP TABLE IF EXISTS news_comments`);

    const query = `
CREATE TABLE news_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
)`;
    await pool.query(query);
  } catch (error) {
    console.error("Error creating form table:", error);
    throw error;
  }
}


module.exports = { 
    createNews_CommentsTable,
    createNewsTable, 
}; 