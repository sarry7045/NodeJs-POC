const db = require('../config/database');

exports.createUser = (req, res) => {
  const { username, password } = req.body;
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
    if (err) return res.status(500).send('Error creating user');
    res.send('User created');
  });
};

exports.getUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send('Error fetching users');
    res.json(results);
  });
};

exports.updateUser = (req, res) => {
  const { id, username } = req.body;
  db.query('UPDATE users SET username = ? WHERE id = ?', [username, id], (err) => {
    if (err) return res.status(500).send('Error updating user');
    res.send('User updated');
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.body;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send('Error deleting user');
    res.send('User deleted');
  });
};