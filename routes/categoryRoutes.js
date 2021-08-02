const express = require('express');
const router = express.Router();
const { createCategory, getCategories, getCategoryById, editCategory, deleteCategory } = require('../controllers/categoryControllers');
const { authCheck, adminCheck } = require('../helpers/auth');



router.post('/categorycreate', authCheck, adminCheck, createCategory);
router.get('/getcategories', getCategories);
router.get('/categorybyid/:categoryId', getCategoryById);
router.post('/categoryedit/:categoryId', authCheck, adminCheck, editCategory);
router.delete('/categorydelete/:categoryId', authCheck, adminCheck, deleteCategory);



module.exports = router;