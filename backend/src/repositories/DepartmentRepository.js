const Department = require('../models/Department');

class DepartmentRepository {
  async create(deptData) {
    const department = new Department(deptData);
    return await department.save();
  }

  async findById(id) {
    return await Department.findById(id);
  }

  async findByName(name) {
    return await Department.findOne({ name });
  }

  async update(id, updateData) {
    return await Department.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Department.findByIdAndDelete(id);
  }

  async findAll() {
    return await Department.find({});
  }
}

module.exports = new DepartmentRepository();
