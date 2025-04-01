const express = require('express');
const router = express.Router();
const {
    createLetter,
    getAllLetters,
    getLetterById,
    updateLetter,
    deleteLetter,
    uploadMiddleware,
    getLettersByCSO
} = require('../controller/letterController');
const verifyToken = require("../middleware/authMiddleware");

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
module.exports = router;


