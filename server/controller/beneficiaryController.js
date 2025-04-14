const { pool } = require('../config/db');
const { createBeneficiaryTable } = require('../model/beneficiary');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const multer = require('multer');

const uploadFolder = path.join(__dirname, '../public/beneficiary');

// File Filters
const idFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed for ID files'), false);
  }
};

const photoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed for photos'), false);
  }
};

const storage = multer.memoryStorage();

// Utility Functions
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
};

const saveFileToDisk = (req, fileField, folderName, identifier) => {
  if (!req.files?.[fileField]?.[0]) return null;
  
  const destFolder = path.join(uploadFolder, folderName);
  ensureFolderExists(destFolder);
  
  const file = req.files[fileField][0];
  const cleanIdentifier = (identifier || 'unknown').replace(/\s+/g, "_");
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(file.originalname);
  const filename = `${cleanIdentifier}_${timestamp}_${randomStr}${ext}`;
  
  const filePath = path.join(destFolder, filename);
  fs.writeFileSync(filePath, file.buffer);
  
  return path.join(folderName, filename).replace(/\\/g, '/');
};

const deleteFileIfExists = async (filePath) => {
  if (filePath) {
    const fullPath = path.join(uploadFolder, filePath);
    try {
      if (fs.existsSync(fullPath)) await fs.promises.unlink(fullPath);
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
      throw err;
    }
  }
};

// Multer Middleware
exports.uploadFiles = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'idFile') return idFileFilter(req, file, cb);
    if (file.fieldname === 'photo') return photoFileFilter(req, file, cb);
    cb(new Error('Invalid file field'));
  }
}).fields([
  { name: 'idFile', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]);

// Controller Methods
exports.createBeneficiary = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  let connection;
  try {
    await createBeneficiaryTable();
    const data = req.body;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check duplicates
    const [existing] = await connection.query(
      `SELECT * FROM beneficiaries WHERE email = ? OR phone = ?`,
      [data.email, data.phone]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: "Account already exists for email or phone" 
      });
    }

    // Process files
    data.idFile = saveFileToDisk(req, "idFile", "idFiles", data.fullName);
    data.photo = saveFileToDisk(req, "photo", "photoFiles", data.fullName);

    // Insert record
    const [result] = await connection.query(`INSERT INTO beneficiaries SET ?`, [data]);
    const insertedId = result.insertId;
    const beneficiary_id = `LA-${insertedId.toString().padStart(5, "0")}`;

    await connection.query(
      `UPDATE beneficiaries SET beneficiary_id = ? WHERE id = ?`,
      [beneficiary_id, insertedId]
    );

    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: "Beneficiary created",
      data: { beneficiary_id, id: insertedId, ...data }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Create error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Operation failed", 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
};

exports.updateBeneficiary = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  let connection;
  try {
    const data = req.body;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get existing files
    const [existing] = await connection.query(
      `SELECT idFile, photo FROM beneficiaries WHERE id = ? FOR UPDATE`,
      [req.params.id]
    );
    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Beneficiary not found" });
    }

    const oldFiles = { idFile: existing[0].idFile, photo: existing[0].photo };
    const newFiles = {
      idFile: req.files?.idFile ? saveFileToDisk(req, "idFile", "idFiles", data.fullName) : null,
      photo: req.files?.photo ? saveFileToDisk(req, "photo", "photoFiles", data.fullName) : null
    };

    // Update record
    await connection.query(
      `UPDATE beneficiaries SET 
        fullName = ?, phone = ?, email = ?, kebele = ?,
        location = ?, wereda = ?, kfleketema = ?, houseNo = ?,
        gender = ?, age = ?, school = ?,
        idFile = COALESCE(?, idFile),
        photo = COALESCE(?, photo)
      WHERE id = ?`,
      [
        data.fullName, data.phone, data.email, data.kebele,
        data.location, data.wereda, data.kfleketema, data.houseNo,
        data.gender, data.age, data.school,
        newFiles.idFile, newFiles.photo, req.params.id
      ]
    );

    await connection.commit();

    // Cleanup old files after successful update
    if (newFiles.idFile) await deleteFileIfExists(oldFiles.idFile);
    if (newFiles.photo) await deleteFileIfExists(oldFiles.photo);

    res.status(200).json({ success: true, message: "Beneficiary updated" });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Update failed", 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
};

exports.deleteBeneficiary = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT idFile, photo FROM beneficiaries WHERE id = ? FOR UPDATE`,
      [req.params.id]
    );
    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Beneficiary not found" });
    }

    await connection.query(`DELETE FROM beneficiaries WHERE id = ?`, [req.params.id]);
    await connection.commit();

    // Delete files after successful commit
    await deleteFileIfExists(existing[0].idFile);
    await deleteFileIfExists(existing[0].photo);

    res.status(200).json({ success: true, message: "Beneficiary deleted" });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Deletion failed", 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
};

// Get methods remain unchanged
exports.getAllBeneficiaries = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM beneficiaries ORDER BY createdAt DESC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ success: false, message: "Fetch failed", error: error.message });
  }
};

exports.getBeneficiaryById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM beneficiaries WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ success: false, message: "Fetch failed", error: error.message });
  }
};