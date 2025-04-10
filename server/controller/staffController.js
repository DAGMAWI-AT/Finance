const express = require("express");
const multer = require("multer");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const path = require("path");
const { pool } = require("../config/db");
const { createStaffTable, staffTable } = require("../model/staff");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use("/staff", express.static(path.join(__dirname, "public/staff")));
const secretKey = process.env.JWT_secretKey;
const restKey = process.env.JWT_SECRET;

const uploadStaffPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const saveFileFromBuffer = async (buffer, filename) => {
  const savePath = path.join(filename);
  await fs.promises.writeFile(savePath, buffer);
};

// Setup nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const registerStaff = async (req, res) => {
  try {
    await createStaffTable();
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const [existingUser] = await pool.query(
      `SELECT * FROM staff WHERE email = ? OR phone = ?`,
      [email, phone]
    );

    const [existingUsersCso] = await pool.query(
      `SELECT * FROM cso WHERE email = ? OR phone = ?`,
      [email, phone]
    );

    if (existingUser.length > 0 || existingUsersCso.length > 0) {
      return res.status(400).json({
        success: false,
        message: "An account already exists for the provided email or phone.",
      });
    }

    // ** Start a transaction to prevent duplicates **
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Fetch the highest existing staff registration ID **inside the transaction**
      const [latestStaff] = await connection.query(
        `SELECT registrationId FROM staff ORDER BY id DESC LIMIT 1`
      );

      let newStaffNumber = 1; // Default if no staff exists
      if (latestStaff.length > 0) {
        const lastRegId = latestStaff[0].registrationId; // e.g., "Staff-0012"
        const lastNumber = parseInt(lastRegId.split("-")[1], 10); // Extract "12"
        newStaffNumber = lastNumber + 1; // Increment to "13"
      }

      let registrationId = `Staff-${String(newStaffNumber).padStart(4, "0")}`;

      // Check for conflicts and regenerate if needed
      let conflict = true;
      while (conflict) {
        const [checkDuplicate] = await connection.query(
          `SELECT COUNT(*) as count FROM ${staffTable} WHERE registrationId = ?`,
          [registrationId]
        );
        if (checkDuplicate[0].count === 0) {
          conflict = false;
        } else {
          newStaffNumber++; // Increment again
          registrationId = `Staff-${String(newStaffNumber).padStart(4, "0")}`;
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
     
      let filename = null;

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        filename = `${name + Date.now()}_${req.file.originalname}`;
        const savePath = path.join(__dirname, "../public/staff", filename);
        await saveFileFromBuffer(req.file.buffer, savePath);
      }
      const staffData = {
        ...req.body,
        registrationId,
        password: hashedPassword,
        email_verified: false,
        photo: filename,
      };

      const [result] = await connection.query(
        `INSERT INTO ${staffTable} SET ?`,
        [staffData]
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      // Generate a verification token
      const verificationToken = jwt.sign(
        { id: result.insertId, email },
        secretKey,
        { expiresIn: "1h" }
      );

      // Send the email verification link
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification",
        html: `<p>Welcome ${name} your registration id is ${registrationId},\n\nPlease click the link below to verify your email and complete your registration:\n\n${process.env.FRONTEND_URL}/verify/${verificationToken}\n\nThis link will expire in 1 hour.</p>`,
      });

      res.json({
        success: true,
        message: "Registration successful! Check your email for verification.",
        result,
      });
    } catch (error) {
      await connection.rollback(); // Rollback if error
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error registering staff:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

async function loginStaff(req, res) {
  try {
    const { registrationId, email, password } = req.body;
    const [staff] = await pool.query(
      `SELECT * FROM staff WHERE registrationId = ? AND email = ?`,
      [registrationId, email]
    );

    if (!staff.length) {
      return res.status(404).json({
        success: false,
        message: "No user found with the provided registration ID or email.",
      });
    }

    const user = staff[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
    }
    if (user.email_verified !== 1) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is unverified. pleas verify your account by email, Please contact support",
      });
    }

    // Verify password (compare plain-text password with hashed password)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        registrationId: user.registrationId,
        role: user.role,
      },
      secretKey,
      { expiresIn: "1h" }
    );

    // Cookie options
    const cookieOptions = {
      httpOnly: true, // Prevent access by JavaScript
      secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // sameSite: "Strict", // Prevent CSRF
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/", // Accessible across the entire site
    };

    // Set cookie
    res.cookie("token", token, cookieOptions);

    // Return success response
    return res.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
// Verify Token (for /me route)
async function me(req, res) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token found",
    });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    res.json({
      success: true,
      role: decoded.role,
      registrationId: decoded.registrationId,
      id: decoded.id,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
}

// Forgot Password - Send reset link
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [staff] = await pool.query(
      `SELECT * FROM ${staffTable} WHERE email = ?`,
      [email]
    );

    if (staff.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Staff not found" });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: staff[0].id }, secretKey, {
      expiresIn: "1h",
    });

    // Send reset email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Click the link (${staff[0].registrationId}) to reset your password: ${process.env.FRONTEND_URL}/resetPassword/${resetToken}`,
    });

    res.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, secretKey);

    // Ensure that the user exists in the database
    const [user] = await pool.query("SELECT * FROM staff WHERE id = ?", [
      decoded.id,
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.query(
      `UPDATE staff SET password = ? WHERE id = ?`,
      [hashedPassword, decoded.id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Error updating password." });
    }

    res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error during password reset:", error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Token expired. Please request a new one." });
    }
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

const logoutStaff = (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

// Get All Staff
const getStaff = async (req, res) => {
  try {
    const [staff] = await pool.query(`SELECT * FROM ${staffTable}`);
    res.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get Staff by ID
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const [staff] = await pool.query(
      `SELECT * FROM ${staffTable} WHERE id = ?`,
      [id]
    );

    if (staff.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    res.json(staff[0]);
  } catch (error) {
    console.error("Error fetching staff by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// update staff data
const updateStaff = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const uploadedFile = req.file;

  try {
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Staff ID is required." });
    }

    if (Object.keys(updateData).length === 0 && !uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update.",
      });
    }

    const [staff] = await pool.query(
      `SELECT * FROM ${staffTable} WHERE id = ?`,
      [id]
    );

    if (!staff.length) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found." });
    }

    if (staff[0].email_verified !== 1) {
      return res.status(403).json({
        success: false,
        message:
          "This account is unverified. Please verify by email or contact support.",
      });
    }

    updateData.updated_at = new Date();

    let newFilename = null;

    if (uploadedFile) {
      const ext = path.extname(uploadedFile.originalname);
      newFilename = `${Date.now()}_${uploadedFile.originalname}`;
      const savePath = path.join(__dirname, "../public/staff", newFilename);

      await saveFileFromBuffer(uploadedFile.buffer, savePath);
      updateData.photo = newFilename;

      if (staff[0].photo) {
        const oldFilePath = path.join(
          __dirname,
          "../public/staff",
          staff[0].photo
        );
        if (fs.existsSync(oldFilePath)) {
          await fs.promises.unlink(oldFilePath);
        }
      }
    }

    const fields = Object.keys(updateData)
      .map((field) => `${field} = ?`)
      .join(", ");
    const values = Object.values(updateData);

    const [result] = await pool.query(
      `UPDATE ${staffTable} SET ${fields} WHERE id = ?`,
      [...values, id]
    );

    return res.json({
      success: true,
      message: "Staff updated successfully",
      result,
    });
  } catch (error) {
    if (uploadedFile) {
      const failedPath = path.join(
        __dirname,
        "../public/staff",
        `${Date.now()}_${uploadedFile.originalname}`
      );
      if (fs.existsSync(failedPath)) {
        await fs.promises.unlink(failedPath);
      }
    }

    console.error("Error updating staff:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

async function updatePassword(req, res) {
  try {
    const staffId = req.user.id; // This should now be correctly set from the token
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    // Fetch user from the database
    const [rows] = await pool.query(`SELECT * FROM staff WHERE id = ?`, [
      staffId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const staff = rows[0]; // Get user data

    // Compare the current password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      staff.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await pool.query(`UPDATE staff SET password = ? WHERE id = ?`, [
      hashedPassword,
      staffId, // Ensure you're using `staffId`, not `userId` which is undefined
    ]);

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Delete Staff
const deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    // First get the photo path before deletion
    const [oldStaffPhoto] = await pool.query(
      `SELECT photo FROM ${staffTable} WHERE id = ?`,
      [id]
    );

    // Delete the staff record
    const [result] = await pool.query(
      `DELETE FROM ${staffTable} WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    // Delete associated photo file if it exists
    if (oldStaffPhoto.length > 0 && oldStaffPhoto[0].photo) {
      const oldFilePath = path.join(
        __dirname,
        "../public/staff",
        oldStaffPhoto[0].photo
      );

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); // Consider using fs.promises.unlink for async
      }
    }

    res.json({
      success: true,
      message: "Staff deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Verify Staff Email
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Decode and verify the JWT token
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded); // Debug: Log the decoded token

    // Check if the staff exists in the database
    const [staff] = await pool.query(
      `SELECT * FROM ${staffTable} WHERE id = ?`,
      [decoded.id]
    );
    console.log(staff); // Debug: Check if staff is found

    if (staff.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found." });
    }

    // Update email verification status
    const [result] = await pool.query(
      `UPDATE ${staffTable} SET email_verified = true WHERE id = ?`,
      [decoded.id]
    );
    console.log(result); // Debug: Check the result of the update operation

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email verification failed." });
    }

    res.json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  registerStaff,
  loginStaff,
  forgotPassword,
  resetPassword,
  logoutStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  verifyEmail,
  updatePassword,
  me,
  uploadStaffPhoto,
};
