const express = require('express');
const router = express.Router();
const gymController = require('../Controllers/gym.js');

router.post('register', gymController.register);
router.post('/login' , gymController.login);

module.exports = router;