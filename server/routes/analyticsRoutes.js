const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/top-sellers - Top 5 selling items
router.get('/top-sellers', analyticsController.getTopSellers);

// GET /api/analytics/summary - Order summary
router.get('/summary', analyticsController.getSummary);

module.exports = router;
