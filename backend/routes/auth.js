const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Google OAuth 2.0 endpoint
router.post('/google', authController.googleLogin);

module.exports = router;
