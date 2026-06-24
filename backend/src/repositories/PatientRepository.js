const Patient = require('../models/Patient');

class PatientRepository {
  async create(patientData) {
    const patient = new Patient(patientData);
    return await patient.save();
  }

  async findById(id) {
    return await Patient.findById(id).populate('userId', '-password');
  }

  async findByUserId(userId) {
    return await Patient.findOne({ userId }).populate('userId', '-password');
  }

  async updateByUserId(userId, updateData) {
    return await Patient.findOneAndUpdate({ userId }, updateData, { new: true, runValidators: true }).populate('userId', '-password');
  }

  async deleteByUserId(userId) {
    return await Patient.findOneAndDelete({ userId });
  }

  async findAll(filter = {}) {
    return await Patient.find(filter).populate('userId', '-password');
  }
}

module.exports = new PatientRepository();
