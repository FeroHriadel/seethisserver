const express = require('express');
const router = express.Router();
const { signup, getUser, getUsers, toggleUserRole, wakeServerUp } = require('../controllers/userControllers');
const { authCheck, adminCheck } = require('../helpers/auth');



router.get('/wakeserverup', wakeServerUp)
router.get('/signup', authCheck, signup);
router.get('/getuser', authCheck, getUser);
router.get('/getusers', authCheck, adminCheck, getUsers);
router.post('/toggleuserrole/:userId', authCheck, adminCheck, toggleUserRole);



module.exports = router;