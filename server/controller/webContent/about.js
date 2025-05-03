const { pool } = require('../../config/db'); // import pool

// Create About
exports.createAbout = async (req, res) => {
  try {
    const {introduction, mission, vision, purpose, core_values } = req.body;

    const [result] = await pool.query(
      `INSERT INTO about_us (introduction, mission, vision, purpose, core_values) VALUES (?, ?, ?, ?, ?)`,
      [introduction, mission, vision, purpose, JSON.stringify(core_values)]
    );

    const [rows] = await pool.query(`SELECT * FROM about_us WHERE id = ?`, [result.insertId]);

    res.status(201).json({
      success: true,
      data: rows[0],
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get About
exports.getAbout = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM about_us LIMIT 1`);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "About section not found" });
    }

    res.json({ success: true, data: rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update About
exports.updateAbout = async (req, res) => {
  try {
    const { id } = req.params;
    const {introduction, mission, vision, purpose, core_values } = req.body;

    const [existing] = await pool.query(`SELECT * FROM about_us WHERE id = ?`, [id]);

    if (!existing.length) {
      return res.status(404).json({ success: false, message: "About section not found" });
    }

    await pool.query(
      `UPDATE about_us SET introduction = ?, mission = ?, vision = ?, purpose = ?, core_values = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [introduction, mission, vision, purpose, JSON.stringify(core_values), id]
    );

    const [rows] = await pool.query(`SELECT * FROM about_us WHERE id = ?`, [id]);

    res.json({
      success: true,
      data: rows[0],
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete About
exports.deleteAbout = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(`SELECT * FROM about_us WHERE id = ?`, [id]);

    if (!existing.length) {
      return res.status(404).json({ success: false, message: "About section not found" });
    }

    await pool.query(`DELETE FROM about_us WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: 'About section deleted successfully',
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
