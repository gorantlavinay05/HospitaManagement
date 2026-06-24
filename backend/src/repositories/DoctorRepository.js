const Doctor = require('../models/Doctor');

class DoctorRepository {
  async create(doctorData) {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
  }

  async findById(id) {
    return await Doctor.findById(id).populate('userId', '-password').populate('departmentId');
  }

  async findByUserId(userId) {
    return await Doctor.findOne({ userId }).populate('userId', '-password').populate('departmentId');
  }

  async updateByUserId(userId, updateData) {
    return await Doctor.findOneAndUpdate({ userId }, updateData, { new: true, runValidators: true }).populate('userId', '-password').populate('departmentId');
  }

  async deleteByUserId(userId) {
    return await Doctor.findOneAndDelete({ userId });
  }

  async findAll(filter = {}) {
    return await Doctor.find(filter).populate('userId', '-password').populate('departmentId');
  }
}

module.exports = new DoctorRepository();
