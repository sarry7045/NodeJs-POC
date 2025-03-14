const db = require('../config/database');
const bcrypt = require('bcrypt');

const User = {
    create: (username, password, callback) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return callback(err);
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], callback);
        });
    },
    findByUsername: (username, callback) => {
        db.query('SELECT * FROM users WHERE username = ?', [username], callback);
    }
};

module.exports = User;