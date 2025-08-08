const express = require('express');
const router = express.Router();
const gymController = require('../Controllers/gym.js');
const admincontroller = require('../Controllers/admincontroller.js');
const auth = require('../Auth/auth.js');

router.post('/register', gymController.register);
router.post('/login' , gymController.login);
router.post('/superadmin/login' , admincontroller.superAdminLogin);
router.post('/superadmin/logout' , admincontroller.superAdminLogout);
router.get('/superadmin/get-pending-gyms' ,auth, admincontroller.getPendingGyms);
router.get('/superadmin/get-approved-gyms' ,auth, admincontroller.getApprovedGyms);
router.get('/superadmin/get-pending-gyms' ,auth, admincontroller.getPendingGyms);
router.post('/superadmin/change-status' ,auth, admincontroller.changeGymStatus);

router.get('/verify-email', gymController.verifyEmail);
router.post('/send-verification-email', gymController.sendVerificationEmail);

router.get('/gym/:gymId/report', gymController.getGymReport);
router.post('/reset-password/sendOtp',gymController.sendOtp)
router.post('/reset-password/checkOtp', gymController.checkOtp);
router.post('/reset-password',gymController.resetPassword);
router.get('/logout', gymController.logout);

module.exports = router;