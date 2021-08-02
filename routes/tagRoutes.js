const express = require('express');
const router = express.Router();
const { createTag, getTags, getTagById, editTag, deleteTag } = require('../controllers/tagControllers');
const { authCheck, adminCheck } = require('../helpers/auth');



router.post('/tagcreate', authCheck, adminCheck, createTag);
router.get('/gettags', getTags);
router.get('/tagbyid/:tagId', getTagById);
router.post('/tagedit/:tagId', authCheck, adminCheck, editTag);
router.delete('/tagdelete/:tagId', authCheck, adminCheck, deleteTag);



module.exports = router;