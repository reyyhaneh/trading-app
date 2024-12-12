const express = require('express');
const router = express.Router();
const { register, login, verifyEmail } = require('../controllers/authController');

// Register a new user
router.post('/register', register);

// Login a user
router.post('/login', login);

router.post('/verify-email', verifyEmail)

module.exports = router;
