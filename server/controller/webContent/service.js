const { pool } = require('../../config/db');

// 📄 Get all services
const getServices = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services');
    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Error fetching services:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ➕ Add a new service
const createService = async (req, res) => {
  const { title, summary } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO services (title, summary) VALUES (?, ?)',
      [title, summary]
    );
    res.status(201).json({ id: result.insertId, title, summary });
  } catch (err) {
    console.error('❌ Error creating service:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ✏️ Update a service
const updateService = async (req, res) => {
  const { id } = req.params;
  const { title, summary } = req.body;
  try {
    await pool.query(
      'UPDATE services SET title = ?, summary = ? WHERE id = ?',
      [title, summary, id]
    );
    res.status(200).json({ id, title, summary });
  } catch (err) {
    console.error('❌ Error updating service:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ❌ Delete a service
const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM services WHERE id = ?', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error('❌ Error deleting service:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};
