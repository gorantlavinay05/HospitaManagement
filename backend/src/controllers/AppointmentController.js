const AppointmentService = require('../services/AppointmentService');

class AppointmentController {
  async book(req, res, next) {
    try {
      const patientUserId = req.user.id;
      const appointment = await AppointmentService.bookAppointment(patientUserId, req.body);
      res.status(201).json({
        status: 'success',
        data: { appointment }
      });
    } catch (err) {
      next(err);
    }
  }

  async getAppointments(req, res, next) {
    try {
      const appointments = await AppointmentService.getAppointments(req.user, req.query);
      res.status(200).json({
        status: 'success',
        results: appointments.length,
        data: { appointments }
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const appointment = await AppointmentService.getAppointmentById(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        data: { appointment }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, reason } = req.body;
      const appointment = await AppointmentService.updateAppointmentStatus(req.params.id, status, reason, req.user);
      res.status(200).json({
        status: 'success',
        data: { appointment }
      });
    } catch (err) {
      next(err);
    }
  }

  async addNotes(req, res, next) {
    try {
      const { consultationNotes } = req.body;
      const appointment = await AppointmentService.updateConsultationNotes(req.params.id, consultationNotes, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { appointment }
      });
    } catch (err) {
      next(err);
    }
  }

  async reschedule(req, res, next) {
    try {
      const { appointmentDate, timeSlot } = req.body;
      const appointment = await AppointmentService.rescheduleAppointment(req.params.id, appointmentDate, timeSlot, req.user);
      res.status(200).json({
        status: 'success',
        data: { appointment }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AppointmentController();
