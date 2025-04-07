const { pool } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createLettersTable } = require('../model/letter');

// Upload middleware
exports.uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpeg|jpg|png|doc|docx/;
    const validMime = allowed.test(file.mimetype);
    const validExt = allowed.test(path.extname(file.originalname).toLowerCase());
    if (validMime && validExt) return cb(null, true);
    cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('attachment');

// Helper to prepare selected_csos field
const prepareSelectedCsos = (input) => {
  if (!input) return null;
  try {
    if (Array.isArray(input)) return input.length ? JSON.stringify(input) : null;
    if (typeof input === 'number') return JSON.stringify([input]);
    if (typeof input === 'string') {
      if (input.startsWith('[') || input.startsWith('{')) {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) && parsed.length ? JSON.stringify(parsed) : null;
      }
      if (/^\d+$/.test(input)) return JSON.stringify([parseInt(input, 10)]);
    }
    return null;
  } catch (e) {
    console.error('prepareSelectedCsos error:', e);
    return null;
  }
};

// Save uploaded file to disk
const saveAttachment = (req) => {
  if (!req.file) return null;

  const folderPath = path.join(__dirname, '..', 'public', 'letter');
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const fileName = `${Date.now()}-${req.file.originalname}`;
  const filePath = path.join(folderPath, fileName);

  fs.writeFileSync(filePath, req.file.buffer);

  return {
    attachment_path: `letter/${fileName}`,
    attachment_name: req.file.originalname,
    attachment_mimetype: req.file.mimetype
  };
};

// Delete file from disk
const deleteAttachment = (relativePath) => {
  const filePath = path.join(__dirname, '..', 'public', relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// CREATE
exports.createLetter = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await createLettersTable();

    const { title, summary, type, sendToAll, selectedCsos } = req.body;
    const userId = req.user.id;

    const letterData = {
      title,
      summary,
      type,
      send_to_all: sendToAll === 'true',
      selected_csos: prepareSelectedCsos(selectedCsos),
      created_by: userId,
      ...saveAttachment(req)
    };

    const [result] = await connection.query(`INSERT INTO letters SET ?`, [letterData]);
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
    console.error('Create letter error:', error);
    res.status(500).json({ success: false, message: 'Failed to create letter', error: error.message });
  } finally {
    connection.release();
  }
};

// UPDATE
exports.updateLetter = async (req, res) => {
  try {
    const letterId = req.params.id;
    const [currentLetter] = await pool.query(`SELECT attachment_path FROM letters WHERE id = ?`, [letterId]);

    if (!currentLetter.length) {
      return res.status(404).json({ success: false, message: 'Letter not found' });
    }

    const { title, summary, type, sendToAll, selectedCsos } = req.body;
    const updateData = {
      title,
      summary,
      type,
      send_to_all: sendToAll === 'true',
      selected_csos: prepareSelectedCsos(selectedCsos),
      updated_at: new Date()
    };

    if (req.file) {
      if (currentLetter[0].attachment_path) {
        deleteAttachment(currentLetter[0].attachment_path);
      }
      Object.assign(updateData, saveAttachment(req));
    }

    const [result] = await pool.query(`UPDATE letters SET ? WHERE id = ?`, [updateData, letterId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Letter not updated' });
    }

    res.status(200).json({ success: true, data: { id: letterId, ...updateData } });
  } catch (error) {
    console.error('Update letter error:', error);
    res.status(500).json({ success: false, message: 'Failed to update letter', error: error.message });
  }
};

// DELETE
exports.deleteLetter = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [letters] = await connection.query(`SELECT attachment_path FROM letters WHERE id = ?`, [req.params.id]);
    if (!letters.length) {
      return res.status(404).json({ success: false, message: 'Letter not found' });
    }

    const [result] = await connection.query(`DELETE FROM letters WHERE id = ?`, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Letter not deleted' });
    }

    if (letters[0].attachment_path) {
      deleteAttachment(letters[0].attachment_path);
    }

    await connection.commit();
    res.status(200).json({ success: true, message: 'Letter deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete letter error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete letter', error: error.message });
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

exports.getLetterById = async (req, res) => {
  try {
    const [letters] = await pool.query(
      `SELECT 
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
      WHERE l.id = ?`,
      [req.params.id]
    );

    if (!letters || letters.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found'
      });
    }

    const parseSelectedCsos = (input) => {
      if (!input) return [];
      try {
        // Handle both stringified JSON and direct array values
        if (typeof input === 'string') {
          // Remove any extra quotes if they exist
          const cleaned = input.replace(/^"+|"+$/g, '');
          const parsed = JSON.parse(cleaned);
          return Array.isArray(parsed) ? parsed : [parsed];
        }
        return Array.isArray(input) ? input : [input];
      } catch (e) {
        console.error('Error parsing selectedCsos:', e);
        return [];
      }
    };

    const letter = letters[0];
    res.status(200).json({
      success: true,
      data: {
        ...letter,
        selectedCsos: parseSelectedCsos(letter.selectedCsos),
        // Ensure consistent field names
        createdBy: letter.createdBy || '1', // Fallback to original ID if name not found
        createdAt: letter.createdAt,
        updatedAt: letter.updatedAt
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
// Get single letter by ID
// exports.getLetterById = async (req, res) => {
//   try {
//     const [letters] = await pool.query(`
//       SELECT 
//         l.id, l.title, l.summary, l.type,
//         l.send_to_all AS sendToAll,
//         l.selected_csos AS selectedCsos,
//         l.attachment_path AS attachmentPath,
//         l.attachment_name AS attachmentName,
//         l.attachment_mimetype AS attachmentMimetype,
//         l.created_at AS createdAt,
//         l.updated_at AS updatedAt,
//         s.name AS createdBy
//       FROM letters l
//       LEFT JOIN staff s ON l.created_by = s.id
//       WHERE l.id = ?
//     `, [req.params.id]);

//     if (!letters || letters.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Letter not found'
//       });
//     }

//     const parseSelectedCsos = (input) => {
//       if (!input) return [];
//       try {
//         const parsed = JSON.parse(input);
//         return Array.isArray(parsed) ? parsed : [parsed];
//       } catch (e) {
//         return [];
//       }
//     };

//     const letter = letters[0];
//     res.status(200).json({
//       success: true,
//       data: {
//         ...letter,
//         selectedCsos: parseSelectedCsos(letter.selectedCsos)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching letter:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch letter',
//       error: error.message
//     });
//   }
// };



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

