const { pool } = require("../../config/db");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 🔧 MULTER CONFIG
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const folderPath = path.join(__dirname, "../../public/hero");
      
      // ✅ Ensure folder exists BEFORE multer writes to it
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
  
      cb(null, folderPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });
  

exports.upload = multer({ storage });

// 📦 Get all hero slides
exports.getSlides = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM hero_slides ORDER BY id ASC`);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.getSlideById = async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query(`SELECT * FROM hero_slides WHERE id = ?`, [id]);
  
      if (!rows.length) {
        return res.status(404).json({ success: false, message: "Slide not found" });
      }
  
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  
// ➕ Create slide with rollback-safe upload
exports.createSlide = async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const image_url = req.file?.filename;

    if (!image_url) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO hero_slides (image_url, title, subtitle) VALUES (?, ?, ?)`,
      [image_url, title, subtitle]
    );

    const [rows] = await pool.query(`SELECT * FROM hero_slides WHERE id = ?`, [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    // Clean orphan file
    if (req.file) {
      const filePath = path.join(__dirname, `../../public/hero/${req.file.filename}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✏️ Update slide with cleanup of old image if replaced
exports.updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle } = req.body;
    const newImage = req.file?.filename;

    const [existing] = await pool.query(`SELECT * FROM hero_slides WHERE id = ?`, [id]);
    if (!existing.length) {
      // Clean up new file if record not found
      if (newImage) {
        const newPath = path.join(__dirname, `../../public/hero/${newImage}`);
        if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
      }
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    const oldImage = existing[0].image_url;

    // Remove old image if new one uploaded
    if (newImage && oldImage) {
      const oldPath = path.join(__dirname, `../../public/hero/${oldImage}`);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.query(
      `UPDATE hero_slides SET image_url = ?, title = ?, subtitle = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newImage || oldImage, title, subtitle, id]
    );

    const [updated] = await pool.query(`SELECT * FROM hero_slides WHERE id = ?`, [id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    // Clean up newly uploaded file on error
    if (req.file) {
      const failedPath = path.join(__dirname, `../../public/hero/${req.file.filename}`);
      if (fs.existsSync(failedPath)) fs.unlinkSync(failedPath);
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// ❌ Delete slide with file removal
exports.deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query(`SELECT * FROM hero_slides WHERE id = ?`, [id]);

    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    const imageFile = existing[0].image_url;
    const filePath = path.join(__dirname, `../../public/hero/${imageFile}`);
    if (imageFile && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query(`DELETE FROM hero_slides WHERE id = ?`, [id]);
    res.json({ success: true, message: "Slide deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
