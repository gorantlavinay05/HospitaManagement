const AdminService = require('../services/AdminService');

class AdminController {
  async getStats(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    } catch (err) {
      next(err);
    }
  }

  async getLogs(req, res, next) {
    try {
      const logs = await AdminService.getActivityLogs();
      res.status(200).json({
        status: 'success',
        results: logs.length,
        data: { logs }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
