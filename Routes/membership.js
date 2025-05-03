const express = require('express');
const router = express.Router();
const MembershipController = require('../Controllers/membership.js');
const auth = require('../Auth/auth.js');

router.post('/add-Membership', auth, MembershipController.addMembership);
router.get('/getMembership', auth, MembershipController.getMembership);

module.exports = router;