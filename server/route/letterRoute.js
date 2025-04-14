const express = require('express');
const router = express.Router();
const {
    createLetter,
    getAllLetters,
    getLetterById,
    updateLetter,
    deleteLetter,
    uploadMiddleware,
    getLettersByCSO,
    getUnreadCount,
    markAsRead
} = require('../controller/letterController');
const verifyToken = require("../middleware/authMiddleware");
const letterController = require('../controller/letterController');

// POST: Create a letter
router.post("/submit", verifyToken, uploadMiddleware, createLetter);

// GET: Retrieve all letters
router.get('/', getAllLetters);
router.get('/get/:id', getLetterById);

// GET: Retrieve a single letter by ID
// router.get('/:id', getLetterById);

// PUT: Update a letter by ID
router.put('/:id', verifyToken, uploadMiddleware, updateLetter);

// DELETE: Delete a letter by ID
router.delete('/:id', verifyToken, deleteLetter);
// GET: Retrieve letters for a specific CSO
router.get('/cso/:csoId', verifyToken, getLettersByCSO);

// router.put('/:id/mark-as-read', verifyToken, letterController.markLetterAsRead);
// router.get('/unread-count', verifyToken, getUnreadCount);
router.put('/:letterId/mark-read/:csoId', verifyToken,markAsRead);

// Unread count route
router.get('/cso/:csoId/unread-count', getUnreadCount);

module.exports = router;


