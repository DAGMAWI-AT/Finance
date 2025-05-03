const { pool } = require("../../config/db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send contact message
exports.createContactMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    const mailOptions = {
      from: email,
      to: "vvman1717@gmail.com",
      subject: `Contact Form: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone || "N/A"}
        Subject: ${subject || "N/A"}
        Message: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
};

// Get the only contact info (the first one)
exports.getContact = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM contact_content LIMIT 1");

    if (!results.length) {
      return res.status(404).json({ message: "No contact info found" });
    }

    const contact = results[0];
    contact.email = JSON.parse(contact.email || "[]");
    contact.phone = JSON.parse(contact.phone || "[]");

    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upsert (Insert if not exists, otherwise Update)
exports.saveContact = async (req, res) => {
  const {
    page_title, description, email, phone,
    location, address, map_embed_url, image_url
  } = req.body;

  try {
    const [existing] = await pool.query("SELECT id FROM contact_content LIMIT 1");

    if (existing.length > 0) {
      // Update
      const id = existing[0].id;
      await pool.query(`
        UPDATE contact_content SET 
        page_title = ?, description = ?, email = ?, phone = ?, location = ?, 
        address = ?, map_embed_url = ?, image_url = ? WHERE id = ?
      `, [
        page_title, description, JSON.stringify(email), JSON.stringify(phone),
        location, address, map_embed_url, image_url, id
      ]);
      res.json({ message: "Contact info updated" });
    } else {
      // Insert
      const [result] = await pool.query(`
        INSERT INTO contact_content 
        (page_title, description, email, phone, location, address, map_embed_url, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        page_title, description, JSON.stringify(email), JSON.stringify(phone),
        location, address, map_embed_url, image_url
      ]);
      res.status(201).json({ message: "Contact info created", id: result.insertId });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Optional: Delete (for admin reset)
exports.deleteContact = async (req, res) => {
  try {
    await pool.query("DELETE FROM contact_content");
    res.json({ message: "All contact info deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
