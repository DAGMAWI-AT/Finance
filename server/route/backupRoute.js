// route/backupRoute.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { backupDatabase, backupFiles, cleanupBackups } = require('../utils/backupUtils');
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Secure backup endpoints
router.use(verifyToken);
router.use(authorizeRoles('admin')); // Assuming authorizeRoles is a function that returns middleware

// Helper function to validate backup filenames
const isValidBackupFile = (filename) => {
  const backupPattern = /^(db_backup|files_backup)_.+\.(sql|tar\.gz)$/;
  return backupPattern.test(filename);
};
router.post('/create', async (req, res) => {
  try {
    await backupDatabase();
    await backupFiles();

    res.status(201).json({
      success: true,
      message: 'Backup created successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: err.message
    });
  }
});

// List available backups
router.get('/list', async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    
    // Check if backup directory exists
    if (!fs.existsSync(backupDir)) {
      return res.status(404).json({
        success: false,
        message: 'Backup directory not found'
      });
    }

    const files = await readdir(backupDir);
    const validBackups = [];

    for (const file of files) {
      // Prevent directory traversal
      const filePath = path.resolve(backupDir, file);
      
      // Ensure the resolved path is inside the backup directory
      if (!filePath.startsWith(path.resolve(backupDir))) {
        continue;
      }

      if (!isValidBackupFile(file)) {
        continue; // Skip non-backup files
      }

      const stats = await stat(filePath);
      validBackups.push({
        filename: file,
        type: file.startsWith('db_backup') ? 'database' : 'files',
        createdAt: stats.birthtime.toISOString(),
        size: stats.size
      });
    }

    // Sort by creation date (newest first)
    validBackups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      backups: validBackups
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to list backups',
      error: err.message
    });
  }
});

// Download backup
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename format
    if (!isValidBackupFile(filename)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup filename'
      });
    }

    const backupDir = path.join(__dirname, '../backups');
    const filePath = path.resolve(backupDir, filename);

    // Prevent directory traversal
    if (!filePath.startsWith(path.resolve(backupDir))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Set proper headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Cache-Control', 'no-store');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle errors during streaming
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming backup file'
        });
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: err.message
    });
  }
});

module.exports = router;