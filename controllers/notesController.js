const db = require('../config/database');

exports.getNotes = (req, res) => {
  const userId = req.user.id;
  db.query('SELECT * FROM city_notes WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching notes:', err);
      return res.status(500).send('Database error');
    }
    res.json(results);
  });
};

exports.addNote = (req, res) => {
  const userId = req.user.id;
  const { city, note } = req.body;
  if (!city || !note) return res.status(400).send('City and note are required');

  db.query('INSERT INTO city_notes (user_id, city, note) VALUES (?, ?, ?)', [userId, city, note], (err) => {
    if (err) {
      console.error('Error adding note:', err);
      return res.status(500).send('Database error');
    }
    res.send('Note added');
  });
};

exports.deleteNote = (req, res) => {
  const userId = req.user.id;
  const { id } = req.body;
  if (!id) return res.status(400).send('Note ID is required');

  db.query('DELETE FROM city_notes WHERE id = ? AND user_id = ?', [id, userId], (err) => {
    if (err) {
      console.error('Error deleting note:', err);
      return res.status(500).send('Database error');
    }
    res.send('Note deleted');
  });
};