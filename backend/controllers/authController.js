const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const { readDatabase, writeDatabase } = require("../config/db");

require("dotenv").config();

const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        let db = readDatabase();
        

        const existingUser = db.users.find(user => user.username === username);
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.users.push({ username, password: hashedPassword });

        writeDatabase(db);

        res.json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error in registration:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Read database
        const db = readDatabase();
        // Find user in JSON database
       
        const user = db.users.find(user => user.username === email);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const refreshTokens = []; // Store refresh tokens in memory (use DB in production)

const refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token: newToken });
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};

module.exports = { login, register, refreshToken };