const DoctorService = require('../services/DoctorService');

class DoctorController {
  async createDoctor(req, res, next) {
    try {
      const { name, email, password, phone, specialization, qualification, experience, consultationFee, departmentId, availability } = req.body;
      const adminUserId = req.user.id;
      const doctor = await DoctorService.createDoctor(
        { name, email, password, phone },
        { specialization, qualification, experience, consultationFee, departmentId, availability },
        adminUserId
      );
      res.status(201).json({
        status: 'success',
        data: { doctor }
      });
    } catch (err) {
      next(err);
    }
  }

  async getDoctorById(req, res, next) {
    try {
      const doctor = await DoctorService.getDoctorById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { doctor }
      });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const doctor = await DoctorService.getDoctorByUserId(req.user.id);
      res.status(200).json({
        status: 'success',
        data: { doctor }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      // Allows doctor to update their own profile, or admin to update doctor profile
      const userId = req.user.role === 'Doctor' ? req.user.id : req.params.id;
      const doctor = await DoctorService.updateDoctorProfile(userId, req.body);
      res.status(200).json({
        status: 'success',
        data: { doctor }
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllDoctors(req, res, next) {
    try {
      const doctors = await DoctorService.getAllDoctors(req.query);
      res.status(200).json({
        status: 'success',
        results: doctors.length,
        data: { doctors }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteDoctor(req, res, next) {
    try {
      await DoctorService.deleteDoctor(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Doctor account deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const { status } = req.body;
      const user = await DoctorService.toggleDoctorStatus(req.params.id, status, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DoctorController();
