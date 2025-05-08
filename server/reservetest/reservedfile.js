
const deleteUploadedFileIfExists = async (file) => {
    if (file) {
      const filePath = path.join(file.destination, file.filename);
      if (fs.existsSync(filePath)) {
        try {
          await fs.promises.unlink(filePath);
          console.log("Unlinked uploaded file:", filePath);
        } catch (err) {
          console.error("Error deleting uploaded file:", err);
        }
      }
    }
  };
  
  const updateStaff = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const uploadedFile = req.file;
  
    if (!id) {
      await deleteUploadedFileIfExists(uploadedFile);
      return res.status(400).json({ success: false, message: "Staff ID is required" });
    }
  
    const [staff] = await pool.query(`SELECT * FROM ${staffTable} WHERE id = ?`, [id]);
  
    if (!staff.length) {
      await deleteUploadedFileIfExists(uploadedFile);
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }
  
    if (staff[0].email_verified !== 1) {
      await deleteUploadedFileIfExists(uploadedFile);
      return res.status(403).json({
        success: false,
        message: "Unverified account. Please verify via email before updating."
      });
    }
  
    try {
      // Prepare allowed fields
      const allowedFields = ["name", "position", "photo", "updated_at"];
      const fieldsToUpdate = {};
  
      allowedFields.forEach(field => {
        if (updateData[field]) fieldsToUpdate[field] = updateData[field];
      });
  
      if (uploadedFile) {
        fieldsToUpdate.photo = uploadedFile.filename;
      }
  
      fieldsToUpdate.updated_at = new Date();
  
      if (Object.keys(fieldsToUpdate).length === 0) {
        throw new Error("No valid fields provided for update.");
      }
  
      // Update database
      const updateFields = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(", ");
      const updateValues = [...Object.values(fieldsToUpdate), id];
  
      const [result] = await pool.query(
        `UPDATE ${staffTable} SET ${updateFields} WHERE id = ?`,
        updateValues
      );
  
      if (result.affectedRows === 0) {
        throw new Error("Update operation failed.");
      }
  
      // Delete old photo if a new one was uploaded
      if (uploadedFile && staff[0].photo) {
        const oldPhotoPath = path.join(__dirname, "../public/staff", staff[0].photo);
        if (fs.existsSync(oldPhotoPath)) {
          await fs.promises.unlink(oldPhotoPath);
        }
      }
  
      return res.json({
        success: true,
        message: "Staff updated successfully",
        data: result
      });
  
    } catch (error) {
      // Delete newly uploaded file if any error occurs in try
      await deleteUploadedFileIfExists(uploadedFile);
  
      console.error("Update staff error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  };
  
// const updateStaff = async (req, res) => {
//   const { id } = req.params;
//   const updateData = req.body;

//   try {
//     if (Object.keys(updateData).length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No data provided for update." });
//     }
//     const [staff] = await pool.query(
//       `SELECT * FROM staff WHERE id = ? `,
//       [id]
//     );

//     if (staff[0].email_verified !== 1) {
//       return res.status(403).json({
//         success: false,
//         message: "this account is unverified. pleas verify this account by email, Please contact support",
//       });
//     }
//     updateData.updated_at = new Date();
//     if (req.file) {
//       updateData.photo = req.file.filename;

//       const [oldStaffPhoto] = await pool.query(
//         `SELECT photo FROM ${staffTable} WHERE id = ?`,
//         [id]
//       );
//       if (oldStaffPhoto.length > 0 && oldStaffPhoto[0].photo) {
//         const oldFilePath = path.join(
//           __dirname,
//           "../public/staff",
//           oldStaffPhoto[0].photo
//         );
//         if (fs.existsSync(oldFilePath)) {
//           fs.unlinkSync(oldFilePath);
//         }
//       }
//     }

//     const fields = Object.keys(updateData)
//       .map((field) => `${field} = ?`)
//       .join(", ");
//     const values = Object.values(updateData);

//     const [result] = await pool.query(
//       `UPDATE ${staffTable} SET ${fields} WHERE id = ?`,
//       [...values, id]
//     );

//     res.json({ success: true, message: "Staff updated successfully", result });
//   } catch (error) {
//     console.error("Error updating staff:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };  // Multer setup for file uploads
// const storageStaffPhoto = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "public/staff"),
//   filename: (req, file, cb) =>
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     ),
// });
// const uploadStaffPhoto = multer({ storage: storageStaffPhoto });










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










// db
// const pool = mysql.createPool({
//   host: process.env.MYSQLHOST || "metro.proxy.rlwy.net",
//   user: process.env.MYSQLUSER || "root",
//   password: process.env.MYSQLPASSWORD || "XttPKaEaUENjbqrQpskEYYcxtiAEIJej",
//   database: process.env.MYSQLDATABASE || "railway",
//   port: process.env.MYSQLPORT || 51952,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });
// if0_37792639_fainance_office	use_name if0_37792639  user_host_name sql309.infinityfree.com	