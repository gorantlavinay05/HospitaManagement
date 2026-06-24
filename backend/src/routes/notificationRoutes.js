const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all notification routes

router.get('/', NotificationController.getMyNotifications);
router.patch('/mark-all-read', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markRead);

module.exports = router;
