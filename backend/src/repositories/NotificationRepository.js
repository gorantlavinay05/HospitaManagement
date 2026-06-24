const Notification = require('../models/Notification');

class NotificationRepository {
  async create(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async findByRecipientId(recipientId) {
    return await Notification.find({ recipientId }).sort({ createdAt: -1 });
  }

  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  async markAllAsRead(recipientId) {
    return await Notification.updateMany({ recipientId, isRead: false }, { isRead: true });
  }
}

module.exports = new NotificationRepository();
