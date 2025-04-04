const { pool } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createLettersTable } = require('../model/letter');

// Configure file storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadDir = 'public/letter';
//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir, { recursive: true });
//         }
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// exports.uploadMiddleware = multer({ 
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         const filetypes = /pdf|jpeg|jpg|png/;
//         const mimetype = filetypes.test(file.mimetype);
//         const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
//         if (mimetype && extname) {
//             return cb(null, true);
//         }
//         cb(new Error('Only PDF, JPEG, and PNG files are allowed'));
//     },
//     limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });


// Helper function to safely prepare selected_csos data
const prepareSelectedCsos = (input) => {
  if (!input) return null;
  
  try {
    // Handle case where input is already an array
    if (Array.isArray(input)) {
      return input.length > 0 ? JSON.stringify(input) : null;
    }
    
    // Handle case where input is a number
    if (typeof input === 'number') {
      return JSON.stringify([input]);
    }
    
    // Handle case where input is a string
    if (typeof input === 'string') {
      // If it's a JSON string, parse and re-stringify
      if (input.startsWith('[') || input.startsWith('{')) {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) && parsed.length > 0 ? JSON.stringify(parsed) : null;
      }
      // If it's a single number as string
      if (/^\d+$/.test(input)) {
        return JSON.stringify([parseInt(input, 10)]);
      }
    }
    
    return null;
  } catch (e) {
    console.error('Error preparing selectedCsos:', e);
    return null;
  }
};


// Configure file storage with 'attachment' field name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/letter';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

exports.uploadMiddleware = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|jpeg|jpg|png|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('attachment'); // Using 'attachment' to match database fields

// Update letter controller
exports.updateLetter = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Get current letter data
        const [currentLetter] = await connection.query(
            `SELECT attachment_path FROM letters WHERE id = ?`,
            [req.params.id]
        );

        const { title, summary, type, sendToAll, selectedCsos } = req.body;
        const letterId = req.params.id;

        const updateData = {
            title,
            summary,
            type,
            send_to_all: sendToAll === 'true',
            selected_csos: prepareSelectedCsos(selectedCsos),
            updated_at: new Date()
        };

        // Handle file upload if present
        if (req.file) {
            // Delete old file if exists
            if (currentLetter.length > 0 && currentLetter[0].attachment_path) {
                const oldFilePath = path.join('public', currentLetter[0].attachment_path);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            
            updateData.attachment_path = req.file.path.replace('public', '');
            updateData.attachment_name = req.file.originalname;
            updateData.attachment_mimetype = req.file.mimetype;
        }

        const [result] = await connection.query(
            `UPDATE letters SET ? WHERE id = ?`,
            [updateData, letterId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Letter not found'
            });
        }

        await connection.commit();
        res.status(200).json({
            success: true,
            data: {
                id: letterId,
                ...updateData
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating letter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update letter',
            error: error.message
        });
    } finally {
        connection.release();
    }
};
// Create a new letter
exports.createLetter = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await createLettersTable();

    const { title, summary, type, sendToAll, selectedCsos } = req.body;
    const userId = req.user.id;

    // Prepare the letter data
    const letterData = {
      title,
      summary,
      type,
      send_to_all: sendToAll === 'true',
      selected_csos: prepareSelectedCsos(selectedCsos),
      created_by: userId
    };

    // Handle file upload if present
    if (req.file) {
      letterData.attachment_path = req.file.filename;
      letterData.attachment_name = req.file.originalname;
      letterData.attachment_mimetype = req.file.mimetype;
    }

    // Execute the query with proper parameter binding
    const [result] = await connection.query(
      `INSERT INTO letters SET ?`,
      [letterData]
    );

    await connection.commit();
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        ...letterData,
        selectedCsos: letterData.selected_csos ? JSON.parse(letterData.selected_csos) : []
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating letter:', error);
    
    let errorMessage = 'Failed to create letter';
    if (error.code === 'ER_INVALID_JSON_TEXT') {
      errorMessage = 'Invalid organization selection format';
    } else if (error.sqlMessage) {
      errorMessage = `Database error: ${error.sqlMessage}`;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Get all letters with safe JSON parsing
exports.getAllLetters = async (req, res) => {
  try {
    const [letters] = await pool.query(`
      SELECT 
        id, title, summary, type,
        send_to_all AS sendToAll,
        selected_csos AS selectedCsos,
        attachment_path AS attachmentPath,
        attachment_name AS attachmentName,
        attachment_mimetype AS attachmentMimetype,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM letters
      ORDER BY created_at DESC
    `);

    const parseSelectedCsos = (input) => {
      if (!input) return [];
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return [];
      }
    };

    res.status(200).json({
      success: true,
      data: letters.map(letter => ({
        ...letter,
        selectedCsos: parseSelectedCsos(letter.selectedCsos)
      }))
    });
  } catch (error) {
    console.error('Error fetching letters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch letters',
      error: error.message
    });
  }
};

// Get single letter by ID
exports.getLetterById = async (req, res) => {
  try {
    const [letters] = await pool.query(`
      SELECT 
        l.id, l.title, l.summary, l.type,
        l.send_to_all AS sendToAll,
        l.selected_csos AS selectedCsos,
        l.attachment_path AS attachmentPath,
        l.attachment_name AS attachmentName,
        l.attachment_mimetype AS attachmentMimetype,
        l.created_at AS createdAt,
        l.updated_at AS updatedAt,
        s.name AS createdBy
      FROM letters l
      LEFT JOIN staff s ON l.created_by = s.id
      WHERE l.id = ?
    `, [req.params.id]);

    if (!letters || letters.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found'
      });
    }

    const parseSelectedCsos = (input) => {
      if (!input) return [];
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return [];
      }
    };

    const letter = letters[0];
    res.status(200).json({
      success: true,
      data: {
        ...letter,
        selectedCsos: parseSelectedCsos(letter.selectedCsos)
      }
    });
  } catch (error) {
    console.error('Error fetching letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch letter',
      error: error.message
    });
  }
};


// // Update letter
// exports.updateLetter = async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const { title, summary, type, sendToAll, selectedCsos } = req.body;
//         const letterId = req.params.id;

//         const updateData = {
//             title,
//             summary,
//             type,
//             send_to_all: sendToAll === 'true',
//             selected_csos: prepareSelectedCsos(selectedCsos),
//             updated_at: new Date()
//         };

//         // If new file uploaded, update file info
//         if (req.file) {
//             updateData.attachment_path = req.file.filename;
//             updateData.attachment_name = req.file.originalname;
//             updateData.attachment_mimetype = req.file.mimetype;
//         }

//         const [result] = await connection.query(
//             `UPDATE letters SET ? WHERE id = ?`,
//             [updateData, letterId]
//         );

//         if (result.affectedRows === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Letter not found'
//             });
//         }

//         await connection.commit();
//         res.status(200).json({
//             success: true,
//             data: {
//                 id: letterId,
//                 ...updateData
//             }
//         });
//     } catch (error) {
//         await connection.rollback();
//         console.error('Error updating letter:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update letter',
//             error: error.message
//         });
//     } finally {
//         connection.release();
//     }
// };

// Delete letter
exports.deleteLetter = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // First get the letter to check for attachment
        const [letters] = await connection.query(
            `SELECT attachment_path FROM letters WHERE id = ?`,
            [req.params.id]
        );

        if (letters.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Letter not found'
            });
        }

        // Delete the letter
        const [result] = await connection.query(
            `DELETE FROM letters WHERE id = ?`,
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Letter not found'
            });
        }

        // If there was an attachment, delete the file
        if (letters[0].attachment_path) {
            const filePath = `public${letters[0].attachment_path}`;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await connection.commit();
        res.status(200).json({
            success: true,
            message: 'Letter deleted successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting letter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete letter',
            error: error.message
        });
    } finally {
        connection.release();
    }
};


// Get letters by CSO organization
exports.getLettersByCSO = async (req, res) => {
    try {
        const csoId = req.params.csoId.toString(); // Ensure csoId is a string

        // Fetch all letters
        const [letters] = await pool.query(`
            SELECT 
                l.id, 
                l.title, 
                l.summary, 
                l.type,
                l.send_to_all AS sendToAll,
                l.selected_csos AS selectedCsosRaw,
                l.attachment_path AS attachmentPath,
                l.attachment_name AS attachmentName,
                l.created_at AS createdAt,
                s.name AS createdBy
            FROM letters l
            LEFT JOIN staff s ON l.created_by = s.id
            ORDER BY l.created_at DESC
        `);

        // Filter letters
        const filteredLetters = letters.filter(letter => {
            if (Number(letter.sendToAll) === 1) return true; // Always include letters for all CSOs

            let selectedCsos = [];
            try {
                if (letter.selectedCsosRaw) {
                    // Ensure parsing works correctly for different formats
                    selectedCsos = typeof letter.selectedCsosRaw === "string"
                        ? JSON.parse(letter.selectedCsosRaw) // Parse if it's a JSON string
                        : letter.selectedCsosRaw; // Use directly if it's already an array

                    if (!Array.isArray(selectedCsos)) {
                        selectedCsos = [selectedCsos]; // Convert single values into an array
                    }
                }
            } catch (e) {
                console.error("Error parsing selectedCsos:", e);
                selectedCsos = []; // Default to an empty array on error
            }

            // Convert all IDs to strings for consistent comparison
            const normalizedCsos = selectedCsos.map(id => id.toString());

            return normalizedCsos.includes(csoId);
        });

        // Format response
        const formattedLetters = filteredLetters.map(letter => ({
            id: letter.id,
            title: letter.title,
            summary: letter.summary,
            type: letter.type,
            sendToAll: Boolean(letter.sendToAll),
            attachmentPath: letter.attachmentPath,
            attachmentName: letter.attachmentName,
            createdAt: letter.createdAt,
            createdBy: letter.createdBy
        }));

        res.status(200).json({
            success: true,
            data: formattedLetters
        });


    } catch (error) {
        console.error('Error fetching letters:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch letters',
            error: error.message
        });
    }
};

