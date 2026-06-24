const UserRepository = require('../repositories/UserRepository');
const DoctorRepository = require('../repositories/DoctorRepository');
const DepartmentRepository = require('../repositories/DepartmentRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const AppError = require('../utils/AppError');

class DoctorService {
  async createDoctor(userData, doctorData, adminUserId) {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    // Verify department exists
    const dept = await DepartmentRepository.findById(doctorData.departmentId);
    if (!dept) {
      throw new AppError('Selected department does not exist', 404);
    }

    userData.role = 'Doctor';
    userData.status = 'active';

    const user = await UserRepository.create(userData);

    try {
      await DoctorRepository.create({
        userId: user._id,
        ...doctorData
      });
    } catch (err) {
      // rollback
      await UserRepository.delete(user._id);
      throw err;
    }

    if (adminUserId) {
      await ActivityLogRepository.create(adminUserId, `Admin created Doctor account for ${user.email}`);
    }

    return await DoctorRepository.findByUserId(user._id);
  }

  async getDoctorById(id) {
    const doctor = await DoctorRepository.findById(id);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }
    return doctor;
  }

  async getDoctorByUserId(userId) {
    const doctor = await DoctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
    }
    return doctor;
  }

  async updateDoctorProfile(userId, updateData) {
    const { name, phone, email, profileImage, ...doctorDetails } = updateData;

    // Update User details if any
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    if (email) userUpdate.email = email;
    if (profileImage !== undefined) userUpdate.profileImage = profileImage;

    if (Object.keys(userUpdate).length > 0) {
      await UserRepository.update(userId, userUpdate);
    }

    // Update Doctor details if any
    if (Object.keys(doctorDetails).length > 0) {
      if (doctorDetails.departmentId) {
        const dept = await DepartmentRepository.findById(doctorDetails.departmentId);
        if (!dept) {
          throw new AppError('Department does not exist', 404);
        }
      }
      await DoctorRepository.updateByUserId(userId, doctorDetails);
    }

    await ActivityLogRepository.create(userId, 'Updated doctor profile');
    return await DoctorRepository.findByUserId(userId);
  }

  async getAllDoctors(filters = {}) {
    const query = {};
    
    if (filters.departmentId) {
      query.departmentId = filters.departmentId;
    }

    if (filters.specialization) {
      query.specialization = { $regex: filters.specialization, $options: 'i' };
    }

    let doctors = await DoctorRepository.findAll(query);

    // If search text is provided for doctor's name
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      doctors = doctors.filter(doc => doc.userId && searchRegex.test(doc.userId.name));
    }

    return doctors;
  }

  async deleteDoctor(userId, adminUserId) {
    const doctor = await DoctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    await DoctorRepository.deleteByUserId(userId);
    await UserRepository.delete(userId);

    if (adminUserId) {
      await ActivityLogRepository.create(adminUserId, `Admin deleted Doctor account for ${userId}`);
    }

    return true;
  }

  async toggleDoctorStatus(userId, status, adminUserId) {
    if (!['active', 'inactive'].includes(status)) {
      throw new AppError('Invalid status value', 400);
    }

    const user = await UserRepository.update(userId, { status });
    if (!user) {
      throw new AppError('Doctor not found', 404);
    }

    if (adminUserId) {
      await ActivityLogRepository.create(adminUserId, `Admin updated Doctor status to ${status} for ${userId}`);
    }

    return user;
  }
}

module.exports = new DoctorService();
