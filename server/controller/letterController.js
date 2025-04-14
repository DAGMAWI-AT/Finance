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

// Helper to prepare selected_csos field with read status
const prepareSelectedCsos = (input, isUpdate = false, existingCsos = null) => {
  if (!input) return null;
  
  try {
    let csosArray = [];
    
    // Parse new input
    if (Array.isArray(input)) {
      csosArray = input;
    } else if (typeof input === 'number') {
      csosArray = [input];
    } else if (typeof input === 'string') {
      if (input.startsWith('[') || input.startsWith('{')) {
        const parsed = JSON.parse(input);
        csosArray = Array.isArray(parsed) ? parsed : [parsed];
      } else if (/^\d+$/.test(input)) {
        csosArray = [parseInt(input, 10)];
      }
    }

    // Handle existing CSOs with better parsing
    if (isUpdate && existingCsos) {
      let existingArray = [];
      
      try {
        // Check if it's already an object
        if (typeof existingCsos === 'object') {
          existingArray = existingCsos;
        } else {
          // Clean string before parsing
          const cleaned = existingCsos
            .replace(/^"+|"+$/g, '')  // Remove surrounding quotes
            .replace(/\\/g, '')       // Remove escape characters
            .replace(/NaN/g, 'null'); // Handle NaN values
            
          existingArray = JSON.parse(cleaned);
        }
      } catch (e) {
        console.error('Error parsing existing CSOs:', e);
        console.error('Problematic data:', existingCsos);
        existingArray = [];
      }

      // Create mapping of existing CSOs
      const existingMap = existingArray.reduce((acc, cso) => {
        const id = cso?.id || cso;
        if (id) acc[id] = cso;
        return acc;
      }, {});

      // Merge with new CSOs
      csosArray = csosArray.map(id => {
        const csoId = typeof id === 'object' ? id.id : id;
        return existingMap[csoId] || { 
          id: csoId, 
          read: 0, 
          read_at: null 
        };
      });
    } else {
      // Initialize new entries
      csosArray = csosArray.map(id => ({
        id: typeof id === 'object' ? id.id : id,
        read: 0,
        read_at: null
      }));
    }

    return csosArray.length ? JSON.stringify(csosArray) : null;
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
    const [currentLetter] = await pool.query(`SELECT attachment_path, selected_csos FROM letters WHERE id = ?`, [letterId]);

    if (!currentLetter.length) {
      return res.status(404).json({ success: false, message: 'Letter not found' });
    }

    const { title, summary, type, sendToAll, selectedCsos } = req.body;
    const updateData = {
      title,
      summary,
      type,
      send_to_all: sendToAll === 'true',
      selected_csos: prepareSelectedCsos(selectedCsos, true, currentLetter[0].selected_csos),
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

    res.status(200).json({ 
      success: true, 
      data: { 
        id: letterId, 
        ...updateData,
        selectedCsos: updateData.selected_csos ? JSON.parse(updateData.selected_csos) : []
      } 
    });
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

// GET ALL 
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
        if (!Array.isArray(parsed)) return [];
        
        // Calculate read count
        const readCount = parsed.filter(cso => cso.read === 1).length;
        const totalCount = parsed.length;
        
        return {
          items: parsed,
          readCount,
          totalCount,
          unreadCount: totalCount - readCount
        };
      } catch (e) {
        return {
          items: [],
          readCount: 0,
          totalCount: 0,
          unreadCount: 0
        };
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

// GET BY ID
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
      if (!input) return {
        items: [],
        readCount: 0,
        totalCount: 0,
        unreadCount: 0
      };
      
      try {
        // Handle both stringified JSON and direct array values
        if (typeof input === 'string') {
          // Remove any extra quotes if they exist
          const cleaned = input.replace(/^"+|"+$/g, '');
          const parsed = JSON.parse(cleaned);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          
          const readCount = items.filter(cso => cso.read === 1).length;
          const totalCount = items.length;
          
          return {
            items,
            readCount,
            totalCount,
            unreadCount: totalCount - readCount
          };
        }
        
        if (Array.isArray(input)) {
          const readCount = input.filter(cso => cso.read === 1).length;
          const totalCount = input.length;
          
          return {
            items: input,
            readCount,
            totalCount,
            unreadCount: totalCount - readCount
          };
        }
        
        return {
          items: [input],
          readCount: input.read === 1 ? 1 : 0,
          totalCount: 1,
          unreadCount: input.read === 1 ? 0 : 1
        };
      } catch (e) {
        console.error('Error parsing selectedCsos:', e);
        return {
          items: [],
          readCount: 0,
          totalCount: 0,
          unreadCount: 0
        };
      }
    };

    const letter = letters[0];
    const selectedCsos = parseSelectedCsos(letter.selectedCsos);
    
    res.status(200).json({
      success: true,
      data: {
        ...letter,
        selectedCsos,
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

// GET LETTER by CSO organization
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

    // Filter letters and update read status if needed
    const filteredLetters = [];
    
    for (const letter of letters) {
      if (Number(letter.sendToAll) === 1) {
        // Always include letters for all CSOs
        filteredLetters.push({
          ...letter,
          isRead: false, // For sendToAll letters, read status isn't tracked per CSO
          selectedCsos: []
        });
        continue;
      }

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

      // Find if this CSO is in the selected list
      const csoEntry = selectedCsos.find(cso => {
        const entryId = typeof cso === 'object' ? cso.id : cso;
        return entryId.toString() === csoId;
      });

      if (csoEntry) {
        const isRead = typeof csoEntry === 'object' ? csoEntry.read === 1 : false;
        
        filteredLetters.push({
          id: letter.id,
          title: letter.title,
          summary: letter.summary,
          type: letter.type,
          sendToAll: Boolean(letter.sendToAll),
          attachmentPath: letter.attachmentPath,
          attachmentName: letter.attachmentName,
          createdAt: letter.createdAt,
          createdBy: letter.createdBy,
          isRead,
          readAt: typeof csoEntry === 'object' ? csoEntry.read_at : null
        });
      }
    }

    res.status(200).json({
      success: true,
      data: filteredLetters
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

// MARK AS READ for a specific CSO
exports.markAsRead = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const letterId = req.params.letterId;
    const csoId = req.params.csoId;
    
    // 1. Verify letter exists
    const [letter] = await connection.query(
      `SELECT id, selected_csos FROM letters WHERE id = ? FOR UPDATE`,
      [letterId]
    );
    
    if (!letter.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Letter not found' 
      });
    }

    // 2. Parse selected_csos with robust error handling
    let selectedCsos = [];
    try {
      if (letter[0].selected_csos) {
        // Handle different data formats
        if (typeof letter[0].selected_csos === 'string') {
          // Clean the JSON string first
          let cleanJson = letter[0].selected_csos
            .replace(/^"+|"+$/g, '') // Remove surrounding quotes
            .replace(/\\/g, '')      // Remove escape characters
            .replace(/NaN/g, 'null') // Handle NaN values
            .replace(/undefined/g, 'null'); // Handle undefined

          // Try parsing the cleaned string
          selectedCsos = JSON.parse(cleanJson);
        } else if (typeof letter[0].selected_csos === 'object') {
          // Already parsed (some DB drivers return objects)
          selectedCsos = letter[0].selected_csos;
        }
      }
      
      // Ensure we have an array
      if (!Array.isArray(selectedCsos)) {
        selectedCsos = [selectedCsos].filter(Boolean);
      }
    } catch (e) {
      console.error('Error parsing selected_csos:', e);
      console.error('Problematic data:', letter[0].selected_csos);
      
      // Fallback - create fresh array with current CSO
      selectedCsos = [{ id: parseInt(csoId), read: 1, read_at: new Date() }];
    }

    // 3. Find and update the CSO's read status
    let csoFound = false;
    const updatedCsos = selectedCsos.map(cso => {
      // Handle both object and primitive ID formats
      const entryId = typeof cso === 'object' ? 
        (cso.id || cso) : 
        cso;
      
      if (entryId.toString() === csoId.toString()) {
        csoFound = true;
        return {
          id: parseInt(csoId),
          read: 1,
          read_at: new Date()
        };
      }
      return cso;
    });

    // If CSO wasn't found in the list, add them
    if (!csoFound) {
      updatedCsos.push({
        id: parseInt(csoId),
        read: 1,
        read_at: new Date()
      });
    }

    // 4. Update the letter
    await connection.query(
      `UPDATE letters 
       SET selected_csos = ?, updated_at = ? 
       WHERE id = ?`,
      [JSON.stringify(updatedCsos), new Date(), letterId]
    );
    
    await connection.commit();
    
    res.status(200).json({ 
      success: true,
      message: 'Letter marked as read',
      data: {
        letterId,
        csoId,
        readAt: new Date()
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark letter as read',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// GET UNREAD COUNT for a CSO
exports.getUnreadCount = async (req, res) => {
  try {
    const csoId = req.params.csoId.toString();
    
    const [letters] = await pool.query(`
      SELECT id, send_to_all, selected_csos 
      FROM letters
      WHERE send_to_all = 1 OR selected_csos LIKE ?
    `, [`%${csoId}%`]);

    let unreadCount = 0;

    for (const letter of letters) {
      if (Number(letter.send_to_all) === 1) {
        // Skip send_to_all letters in count (or include if needed)
        continue;
      }

      try {
        let selectedCsos = letter.selected_csos;
        
        // Handle already parsed objects
        if (typeof selectedCsos === 'object' && selectedCsos !== null) {
          // No parsing needed
        }
        // Handle string JSON
        else if (typeof selectedCsos === 'string') {
          // Clean the string first
          const cleaned = selectedCsos
            .replace(/^"+|"+$/g, '')
            .replace(/\\/g, '')
            .replace(/undefined/g, 'null');
          
          try {
            selectedCsos = JSON.parse(cleaned);
          } catch (parseError) {
            // Fallback to extracting IDs directly
            const idMatches = cleaned.match(/\d+/g) || [];
            selectedCsos = idMatches.map(id => ({ id: parseInt(id), read: 0 }));
          }
        } else {
          selectedCsos = [];
        }

        // Ensure we have an array
        const csosArray = Array.isArray(selectedCsos) ? selectedCsos : [selectedCsos];
        
        // Find this specific CSO's entry
        const csoEntry = csosArray.find(cso => {
          if (!cso) return false;
          
          const entryId = typeof cso === 'object' ? 
            (cso.id || cso) : 
            cso;
            
          return entryId.toString() === csoId;
        });

        // Only count if this CSO is specifically addressed
        if (csoEntry) {
          const isRead = typeof csoEntry === 'object' ? 
            (csoEntry.read === 1 || csoEntry.read === true) : 
            false;
            
          if (!isRead) unreadCount++;
        }
      } catch (e) {
        console.error(`Error processing letter ${letter.id}:`, e.message);
        // Continue to next letter
      }
    }

    res.status(200).json({
      success: true,
      data: { 
        csoId,
        unreadCount 
      }
    });
  } catch (error) {
    console.error('System error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};




























// const { pool } = require('../config/db');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { createLettersTable } = require('../model/letter');

// // Upload middleware
// exports.uploadMiddleware = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     const allowed = /pdf|jpeg|jpg|png|doc|docx/;
//     const validMime = allowed.test(file.mimetype);
//     const validExt = allowed.test(path.extname(file.originalname).toLowerCase());
//     if (validMime && validExt) return cb(null, true);
//     cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
//   },
//   limits: { fileSize: 5 * 1024 * 1024 }
// }).single('attachment');

// // Helper to prepare selected_csos field
// const prepareSelectedCsos = (input) => {
//   if (!input) return null;
//   try {
//     if (Array.isArray(input)) return input.length ? JSON.stringify(input) : null;
//     if (typeof input === 'number') return JSON.stringify([input]);
//     if (typeof input === 'string') {
//       if (input.startsWith('[') || input.startsWith('{')) {
//         const parsed = JSON.parse(input);
//         return Array.isArray(parsed) && parsed.length ? JSON.stringify(parsed) : null;
//       }
//       if (/^\d+$/.test(input)) return JSON.stringify([parseInt(input, 10)]);
//     }
//     return null;
//   } catch (e) {
//     console.error('prepareSelectedCsos error:', e);
//     return null;
//   }
// };

// // Save uploaded file to disk
// const saveAttachment = (req) => {
//   if (!req.file) return null;

//   const folderPath = path.join(__dirname, '..', 'public', 'letter');
//   if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

//   const fileName = `${Date.now()}-${req.file.originalname}`;
//   const filePath = path.join(folderPath, fileName);

//   fs.writeFileSync(filePath, req.file.buffer);

//   return {
//     attachment_path: `letter/${fileName}`,
//     attachment_name: req.file.originalname,
//     attachment_mimetype: req.file.mimetype
//   };
// };

// // Delete file from disk
// const deleteAttachment = (relativePath) => {
//   const filePath = path.join(__dirname, '..', 'public', relativePath);
//   if (fs.existsSync(filePath)) {
//     fs.unlinkSync(filePath);
//   }
// };

// // CREATE
// exports.createLetter = async (req, res) => {
//   const connection = await pool.getConnection();
//   try {
//     await connection.beginTransaction();
//     await createLettersTable();

//     const { title, summary, type, sendToAll, selectedCsos } = req.body;
//     const userId = req.user.id;

//     const letterData = {
//       title,
//       summary,
//       type,
//       send_to_all: sendToAll === 'true',
//       selected_csos: prepareSelectedCsos(selectedCsos),
//       created_by: userId,
//       ...saveAttachment(req)
//     };

//     const [result] = await connection.query(`INSERT INTO letters SET ?`, [letterData]);
//     await connection.commit();

//     res.status(201).json({
//       success: true,
//       data: {
//         id: result.insertId,
//         ...letterData,
//         selectedCsos: letterData.selected_csos ? JSON.parse(letterData.selected_csos) : []
//       }
//     });
//   } catch (error) {
//     await connection.rollback();
//     console.error('Create letter error:', error);
//     res.status(500).json({ success: false, message: 'Failed to create letter', error: error.message });
//   } finally {
//     connection.release();
//   }
// };

// // UPDATE
// exports.updateLetter = async (req, res) => {
//   try {
//     const letterId = req.params.id;
//     const [currentLetter] = await pool.query(`SELECT attachment_path FROM letters WHERE id = ?`, [letterId]);

//     if (!currentLetter.length) {
//       return res.status(404).json({ success: false, message: 'Letter not found' });
//     }

//     const { title, summary, type, sendToAll, selectedCsos } = req.body;
//     const updateData = {
//       title,
//       summary,
//       type,
//       send_to_all: sendToAll === 'true',
//       selected_csos: prepareSelectedCsos(selectedCsos),
//       updated_at: new Date()
//     };

//     if (req.file) {
//       if (currentLetter[0].attachment_path) {
//         deleteAttachment(currentLetter[0].attachment_path);
//       }
//       Object.assign(updateData, saveAttachment(req));
//     }

//     const [result] = await pool.query(`UPDATE letters SET ? WHERE id = ?`, [updateData, letterId]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: 'Letter not updated' });
//     }

//     res.status(200).json({ success: true, data: { id: letterId, ...updateData } });
//   } catch (error) {
//     console.error('Update letter error:', error);
//     res.status(500).json({ success: false, message: 'Failed to update letter', error: error.message });
//   }
// };

// // DELETE
// exports.deleteLetter = async (req, res) => {
//   const connection = await pool.getConnection();
//   try {
//     await connection.beginTransaction();

//     const [letters] = await connection.query(`SELECT attachment_path FROM letters WHERE id = ?`, [req.params.id]);
//     if (!letters.length) {
//       return res.status(404).json({ success: false, message: 'Letter not found' });
//     }

//     const [result] = await connection.query(`DELETE FROM letters WHERE id = ?`, [req.params.id]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: 'Letter not deleted' });
//     }

//     if (letters[0].attachment_path) {
//       deleteAttachment(letters[0].attachment_path);
//     }

//     await connection.commit();
//     res.status(200).json({ success: true, message: 'Letter deleted successfully' });
//   } catch (error) {
//     await connection.rollback();
//     console.error('Delete letter error:', error);
//     res.status(500).json({ success: false, message: 'Failed to delete letter', error: error.message });
//   } finally {
//     connection.release();
//   }
// };
// //GET ALL 
// exports.getAllLetters = async (req, res) => {
//   try {
//     const [letters] = await pool.query(`
//       SELECT 
//         id, title, summary, type,
//         send_to_all AS sendToAll,
//         selected_csos AS selectedCsos,
//         attachment_path AS attachmentPath,
//         attachment_name AS attachmentName,
//         attachment_mimetype AS attachmentMimetype,
//         created_by AS createdBy,
//         created_at AS createdAt,
//         updated_at AS updatedAt
//       FROM letters
//       ORDER BY created_at DESC
//     `);

//     const parseSelectedCsos = (input) => {
//       if (!input) return [];
//       try {
//         const parsed = JSON.parse(input);
//         return Array.isArray(parsed) ? parsed : [parsed];
//       } catch (e) {
//         return [];
//       }
//     };

//     res.status(200).json({
//       success: true,
//       data: letters.map(letter => ({
//         ...letter,
//         selectedCsos: parseSelectedCsos(letter.selectedCsos)
//       }))
//     });
//   } catch (error) {
//     console.error('Error fetching letters:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch letters',
//       error: error.message
//     });
//   }
// };
// //GET BY ID
// exports.getLetterById = async (req, res) => {
//   try {
//     const [letters] = await pool.query(
//       `SELECT 
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
//       WHERE l.id = ?`,
//       [req.params.id]
//     );

//     if (!letters || letters.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Letter not found'
//       });
//     }

//     const parseSelectedCsos = (input) => {
//       if (!input) return [];
//       try {
//         // Handle both stringified JSON and direct array values
//         if (typeof input === 'string') {
//           // Remove any extra quotes if they exist
//           const cleaned = input.replace(/^"+|"+$/g, '');
//           const parsed = JSON.parse(cleaned);
//           return Array.isArray(parsed) ? parsed : [parsed];
//         }
//         return Array.isArray(input) ? input : [input];
//       } catch (e) {
//         console.error('Error parsing selectedCsos:', e);
//         return [];
//       }
//     };

//     const letter = letters[0];
//     res.status(200).json({
//       success: true,
//       data: {
//         ...letter,
//         selectedCsos: parseSelectedCsos(letter.selectedCsos),
//         // Ensure consistent field names
//         createdBy: letter.createdBy || '1', // Fallback to original ID if name not found
//         createdAt: letter.createdAt,
//         updatedAt: letter.updatedAt
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

// // GET LETTER by CSO organization
// exports.getLettersByCSO = async (req, res) => {
//     try {
//         const csoId = req.params.csoId.toString(); // Ensure csoId is a string

//         // Fetch all letters
//         const [letters] = await pool.query(`
//             SELECT 
//                 l.id, 
//                 l.title, 
//                 l.summary, 
//                 l.type,
//                 l.send_to_all AS sendToAll,
//                 l.selected_csos AS selectedCsosRaw,
//                 l.attachment_path AS attachmentPath,
//                 l.attachment_name AS attachmentName,
//                 l.created_at AS createdAt,
//                 s.name AS createdBy
//             FROM letters l
//             LEFT JOIN staff s ON l.created_by = s.id
//             ORDER BY l.created_at DESC
//         `);

//         // Filter letters
//         const filteredLetters = letters.filter(letter => {
//             if (Number(letter.sendToAll) === 1) return true; // Always include letters for all CSOs

//             let selectedCsos = [];
//             try {
//                 if (letter.selectedCsosRaw) {
//                     // Ensure parsing works correctly for different formats
//                     selectedCsos = typeof letter.selectedCsosRaw === "string"
//                         ? JSON.parse(letter.selectedCsosRaw) // Parse if it's a JSON string
//                         : letter.selectedCsosRaw; // Use directly if it's already an array

//                     if (!Array.isArray(selectedCsos)) {
//                         selectedCsos = [selectedCsos]; // Convert single values into an array
//                     }
//                 }
//             } catch (e) {
//                 console.error("Error parsing selectedCsos:", e);
//                 selectedCsos = []; // Default to an empty array on error
//             }

//             // Convert all IDs to strings for consistent comparison
//             const normalizedCsos = selectedCsos.map(id => id.toString());

//             return normalizedCsos.includes(csoId);
//         });

//         // Format response
//         const formattedLetters = filteredLetters.map(letter => ({
//             id: letter.id,
//             title: letter.title,
//             summary: letter.summary,
//             type: letter.type,
//             sendToAll: Boolean(letter.sendToAll),
//             attachmentPath: letter.attachmentPath,
//             attachmentName: letter.attachmentName,
//             createdAt: letter.createdAt,
//             createdBy: letter.createdBy
//         }));

//         res.status(200).json({
//             success: true,
//             data: formattedLetters
//         });


//     } catch (error) {
//         console.error('Error fetching letters:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch letters',
//             error: error.message
//         });
//     }
// };

