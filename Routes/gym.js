const express = require('express');
const router = express.Router();
const gymController = require('../Controllers/gym.js');

router.post('/register', gymController.register);
router.post('/login' , gymController.login);
router.post('/reset-password/sendOtp',gymController.sendOtp)

module.exports = router;