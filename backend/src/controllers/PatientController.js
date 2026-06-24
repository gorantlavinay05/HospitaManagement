const PatientService = require('../services/PatientService');

class PatientController {
  async getPatientById(req, res, next) {
    try {
      const patient = await PatientService.getPatientById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { patient }
      });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const patient = await PatientService.getPatientByUserId(req.user.id);
      res.status(200).json({
        status: 'success',
        data: { patient }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.role === 'Patient' ? req.user.id : req.params.id;
      const patient = await PatientService.updatePatientProfile(userId, req.body);
      res.status(200).json({
        status: 'success',
        data: { patient }
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllPatients(req, res, next) {
    try {
      const patients = await PatientService.getAllPatients(req.query);
      res.status(200).json({
        status: 'success',
        results: patients.length,
        data: { patients }
      });
    } catch (err) {
      next(err);
    }
  }

  async deletePatient(req, res, next) {
    try {
      await PatientService.deletePatient(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Patient account deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const { status } = req.body;
      const user = await PatientService.togglePatientStatus(req.params.id, status, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PatientController();
