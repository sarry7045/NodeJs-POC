const db = require('../config/database');

exports.getPreferences = (req, res) => {
  const userId = req.user.id;
  db.query('SELECT city FROM user_preferences WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching preferences:', err);
      return res.status(500).send('Database error');
    }
    res.json(results.map(row => row.city));
  });
};

exports.addPreference = (req, res) => {
  const userId = req.user.id;
  const { city } = req.body;
  if (!city) return res.status(400).send('City is required');

  db.query('INSERT INTO user_preferences (user_id, city) VALUES (?, ?)', [userId, city], (err) => {
    if (err) {
      console.error('Error adding preference:', err);
      return res.status(500).send('Database error');
    }
    res.send('City added to preferences');
  });
};

exports.deletePreference = (req, res) => {
  const userId = req.user.id;
  const { city } = req.body;
  if (!city) return res.status(400).send('City is required');

  db.query('DELETE FROM user_preferences WHERE user_id = ? AND city = ?', [userId, city], (err) => {
    if (err) {
      console.error('Error deleting preference:', err);
      return res.status(500).send('Database error');
    }
    res.send('City removed from preferences');
  });
};