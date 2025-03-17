const express = require("express");
const { login, register, refreshToken } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshToken);

module.exports = router;