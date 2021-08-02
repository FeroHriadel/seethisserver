const express = require('express');
const router = express.Router();
const { createSpot, getSpotImage, getSpots, getSpotBySlug, editSpot, getSpotsByEmail, deleteSpot, getSpotsByCategory } = require('../controllers/spotControllers');
const { authCheck, adminCheck } = require('../helpers/auth');



router.post('/spotcreate', authCheck, createSpot);
router.get('/getspotimage/:spotslug', getSpotImage);
router.get('/getspots', getSpots);
router.get('/getspotbyslug', getSpotBySlug);
router.post('/spotedit', authCheck, editSpot);
router.get('/getspotsbyemail', authCheck, getSpotsByEmail);
router.delete('/deletespot/:spotId', authCheck, adminCheck, deleteSpot);
router.get('/spotsbycategory/:categoryId', getSpotsByCategory)



module.exports = router;