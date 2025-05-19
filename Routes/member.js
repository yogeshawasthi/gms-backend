const express = require('express');
const router = express.Router();
const MemberController = require('../Controllers/members.js');
const auth = require('../Auth/auth.js');

router.get('/all-member', auth, MemberController.getAllmember);
router.post('/register-member', auth, MemberController.registerMember);

router.get('/searched-member', auth, MemberController.searchMeber);
router.get('/monthly-member', auth, MemberController.monthlyMember);
router.get('/within-3-days-expiring', auth, MemberController.expiringWithin3Days);
router.get('/within-4-7-expiring', auth, MemberController.expiringWithin4To7Days);
router.get('/expired-member', auth, MemberController.expiredMembers);
router.get('/inactive-member', auth, MemberController.inActiveMember);

router.get('/get-member/:id',auth,MemberController.getMemberDetails);
router.post('/change-status/:id', auth, MemberController.changeStatus);
router.put('/update-member-plan/:id',auth,MemberController.updateMemberPlan)
module.exports = router;