const express = require('express');
const router = express.Router();
const MembershipController = require('../Controllers/membership.js');
const auth = require('../Auth/auth.js');

// Route to add a membership
router.post('/add-Membership',auth, MembershipController.addMembership);

// Route to get memberships
router.get('/getMembership', auth, MembershipController.getMembership);

module.exports = router;