
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