const { pool } = require("../../config/db");
const multer = require("multer");
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

// Ensure folder exists
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Save file and return its relative path
const processFile = (file, folderName) => {
  if (!file) return null;

  const uploadFolder = path.join(__dirname, `../../public/${folderName}`);
  ensureFolderExists(uploadFolder);

  const filename = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadFolder, filename);

  fs.writeFileSync(filePath, file.buffer);
  return `${folderName}/${filename}`;
};

// Multer memory storage
const storage = multer.memoryStorage();
exports.upload = multer({ storage });

// ========================
// News Controller
// ========================

// Create News
exports.createNews = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const data = req.body;
    const userId = req.user.id;
    const [authorResult] = await pool.query(
      `SELECT name FROM staff WHERE id = ?`, 
      [userId]
    );
    if (!authorResult.length) {
      return res.status(403).json({ success: false, error: "Unauthorized access" });
    }
    data.author= authorResult[0].name
    data.image =  processFile(req.file, "news") ;
    const [result] = await pool.query(`INSERT INTO news SET ?`, data);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All News with Pagination
exports.getNews = async (req, res) => {
  try {
   
    const [news] = await pool.query(`SELECT * FROM news`);


    res.json({ success: true, data: news});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get News by ID
exports.getNewsById = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM news WHERE id = ?`, [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "News not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update News
exports.updateNews = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(`SELECT * FROM news WHERE id = ?`, [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "News not found" });
    }
    const [authorResult] = await pool.query(
      `SELECT name FROM staff WHERE id = ?`, 
      [userId]
    );
    if (!authorResult.length) {
      return res.status(403).json({ success: false, error: "Unauthorized access" });
    }
    const existingNews = rows[0];
    const data = req.body;
    data.author= authorResult[0].name

    if (req.file) {
      data.image = processFile(req.file, "news");

      if (existingNews.image) {
        const oldImagePath = path.join(__dirname, "../../public", existingNews.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await pool.query(`UPDATE news SET ? WHERE id = ?`, [data, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete News
exports.deleteNews = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM news WHERE id = ?`, [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "News not found" });
    }

    const news = rows[0];
    await pool.query(`DELETE FROM news WHERE id = ?`, [req.params.id]);

    if (news.image) {
      const imagePath = path.join(__dirname, "../../public", news.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================
// News Comments Controller
// ========================

exports.createComment = async (req, res) => {
  try {
    const commentData = {
      ...req.body,
      news_id: req.params.newsId,
    };

    const [result] = await pool.query(`INSERT INTO news_comments SET ?`, commentData);
    const [rows] = await pool.query(`
      SELECT * FROM news_comments 
      WHERE id = ?`, [result.insertId]);
    
    res.status(201).json({ 
      success: true, 
      data: rows[0] 
    });
    // res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.createAdminComment = async (req, res) => {
    try {
      const userId = req.user.id;
      const [authorResult] = await pool.query(
        `SELECT name, email FROM staff WHERE id = ?`, 
        [userId]
      );
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
  
      if (!req.body.content) {
        return res.status(400).json({ success: false, error: "Content is required" });
      }
  
      const commentData = {
        content: req.body.content,
        news_id: req.params.newsId,
        name: authorResult[0].name,
        email: authorResult[0].email
      };
  
      const [result] = await pool.query(`INSERT INTO news_comments SET ?`, commentData);
      
      // Get the full comment data to return
      const [rows] = await pool.query(`
        SELECT * FROM news_comments 
        WHERE id = ?`, [result.insertId]);
      
      res.status(201).json({ 
        success: true, 
        data: rows[0] 
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
exports.getComments = async (req, res) => {
  try {
    const [comments] = await pool.query(
      `SELECT * FROM news_comments WHERE news_id = ? ORDER BY created_at DESC`,
      [req.params.newsId]
    );
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE news_comments SET ? WHERE id = ?`,
      [req.body, req.params.commentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Comment not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM news_comments WHERE id = ?`,
      [req.params.commentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Comment not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
