
//made by sid 
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/insights', analyticsController.getInsights);

module.exports = router;
