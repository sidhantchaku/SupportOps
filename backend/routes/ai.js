//made by sid 
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/summary/:id', aiController.generateSummary);
router.get('/patterns', aiController.getPatternAnalysis);

module.exports = router;
