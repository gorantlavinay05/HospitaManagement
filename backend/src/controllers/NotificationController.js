const NotificationRepository = require('../repositories/NotificationRepository');

class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const recipientId = req.user.id;
      const notifications = await NotificationRepository.findByRecipientId(recipientId);
      res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: { notifications }
      });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await NotificationRepository.markAsRead(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { notification }
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      const recipientId = req.user.id;
      await NotificationRepository.markAllAsRead(recipientId);
      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
