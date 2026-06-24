const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.get('/stats', protect, restrictTo('Admin'), AdminController.getStats);
router.get('/logs', protect, restrictTo('Admin'), AdminController.getLogs);

module.exports = router;
