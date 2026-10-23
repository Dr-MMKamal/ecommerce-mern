const router = require('express').Router();
const { getStats } = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);

module.exports = router;
