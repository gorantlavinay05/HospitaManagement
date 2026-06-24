const ActivityLog = require('../models/ActivityLog');

class ActivityLogRepository {
  async create(userId, action) {
    const log = new ActivityLog({ userId, action });
    return await log.save();
  }

  async findAll() {
    return await ActivityLog.find({})
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 });
  }

  async findByUserId(userId) {
    return await ActivityLog.find({ userId })
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 });
  }
}

module.exports = new ActivityLogRepository();
