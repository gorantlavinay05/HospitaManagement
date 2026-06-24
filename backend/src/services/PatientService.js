const UserRepository = require('../repositories/UserRepository');
const PatientRepository = require('../repositories/PatientRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const AppError = require('../utils/AppError');

class PatientService {
  async getPatientById(id) {
    const patient = await PatientRepository.findById(id);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }
    return patient;
  }

  async getPatientByUserId(userId) {
    const patient = await PatientRepository.findByUserId(userId);
    if (!patient) {
      throw new AppError('Patient profile not found', 404);
    }
    return patient;
  }

  async updatePatientProfile(userId, updateData) {
    const { name, phone, email, profileImage, ...patientDetails } = updateData;

    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    if (email) userUpdate.email = email;
    if (profileImage !== undefined) userUpdate.profileImage = profileImage;

    if (Object.keys(userUpdate).length > 0) {
      await UserRepository.update(userId, userUpdate);
    }

    if (Object.keys(patientDetails).length > 0) {
      await PatientRepository.updateByUserId(userId, patientDetails);
    }

    await ActivityLogRepository.create(userId, 'Updated patient profile');
    return await PatientRepository.findByUserId(userId);
  }

  async getAllPatients(filters = {}) {
    let patients = await PatientRepository.findAll({});
    
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      patients = patients.filter(
        pat => pat.userId && (searchRegex.test(pat.userId.name) || searchRegex.test(pat.userId.email))
      );
    }
    return patients;
  }

  async deletePatient(userId, adminUserId) {
    const patient = await PatientRepository.findByUserId(userId);
    if (!patient) {
      throw new AppError('Patient profile not found', 404);
    }

    await PatientRepository.deleteByUserId(userId);
    await UserRepository.delete(userId);

    if (adminUserId) {
      await ActivityLogRepository.create(adminUserId, `Admin deleted Patient account ${userId}`);
    }

    return true;
  }

  async togglePatientStatus(userId, status, adminUserId) {
    if (!['active', 'inactive'].includes(status)) {
      throw new AppError('Invalid status value', 400);
    }

    const user = await UserRepository.update(userId, { status });
    if (!user) {
      throw new AppError('Patient not found', 404);
    }

    if (adminUserId) {
      await ActivityLogRepository.create(adminUserId, `Admin updated Patient status to ${status} for ${userId}`);
    }

    return user;
  }
}

module.exports = new PatientService();
