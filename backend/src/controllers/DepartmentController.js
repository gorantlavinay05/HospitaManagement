const DepartmentService = require('../services/DepartmentService');

class DepartmentController {
  async create(req, res, next) {
    try {
      const { name, description } = req.body;
      const dept = await DepartmentService.createDepartment({ name, description }, req.user.id);
      res.status(201).json({
        status: 'success',
        data: { department: dept }
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const dept = await DepartmentService.updateDepartment(req.params.id, req.body, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { department: dept }
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await DepartmentService.deleteDepartment(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Department deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const departments = await DepartmentService.getAllDepartments();
      res.status(200).json({
        status: 'success',
        results: departments.length,
        data: { departments }
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const department = await DepartmentService.getDepartmentById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { department }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DepartmentController();
