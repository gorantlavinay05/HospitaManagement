const DepartmentRepository = require('../repositories/DepartmentRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const AppError = require('../utils/AppError');

class DepartmentService {
  async createDepartment(deptData, adminUserId) {
    const existing = await DepartmentRepository.findByName(deptData.name);
    if (existing) {
      throw new AppError('Department name already exists', 400);
    }

    const dept = await DepartmentRepository.create(deptData);

    if (adminUserId) {
      await ActivityLogRepository.create(adminUserId, `Created department: ${dept.name}`);
    }

    return dept;
  }

  async updateDepartment(id, updateData, adminUserId) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    if (updateData.name && updateData.name !== dept.name) {
      const existing = await DepartmentRepository.findByName(updateData.name);
      if (existing) {
        throw new AppError('Department name already exists', 400);
      }
    }

    const updatedDept = await DepartmentRepository.update(id, updateData);

    if (adminUserId) {
      await ActivityLogRepository.create(adminUserId, `Updated department: ${updatedDept.name}`);
    }

    return updatedDept;
  }

  async deleteDepartment(id, adminUserId) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    await DepartmentRepository.delete(id);

    if (adminUserId) {
      await ActivityLogRepository.create(adminUserId, `Deleted department: ${dept.name}`);
    }

    return true;
  }

  async getAllDepartments() {
    return await DepartmentRepository.findAll();
  }

  async getDepartmentById(id) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) {
      throw new AppError('Department not found', 404);
    }
    return dept;
  }
}

module.exports = new DepartmentService();
