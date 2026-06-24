const AppointmentRepository = require('../repositories/AppointmentRepository');
const UserRepository = require('../repositories/UserRepository');
const DoctorRepository = require('../repositories/DoctorRepository');
const NotificationRepository = require('../repositories/NotificationRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const AppError = require('../utils/AppError');

class AppointmentService {
  async bookAppointment(patientUserId, appointmentData) {
    const { doctorId, appointmentDate, timeSlot, reason } = appointmentData;

    // Check doctor exists
    const doctor = await DoctorRepository.findByUserId(doctorId);
    if (!doctor) {
      throw new AppError('Selected doctor does not exist', 404);
    }
    if (doctor.userId.status !== 'active') {
      throw new AppError('Selected doctor is currently not active', 400);
    }

    // Verify appointment day is part of doctor working days
    const dateObj = new Date(appointmentDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const appointmentDay = days[dateObj.getDay()];

    if (!doctor.availability.workingDays.includes(appointmentDay)) {
      throw new AppError(`Doctor does not work on ${appointmentDay}s`, 400);
    }

    // Verify time slot is valid
    if (!doctor.availability.timeSlots.includes(timeSlot)) {
      throw new AppError('Invalid time slot selected', 400);
    }

    // Check if doctor already has a booking at this date & slot
    const existing = await AppointmentRepository.findAll({
      doctorId,
      appointmentDate: {
        $gte: new Date(new Date(appointmentDate).setUTCHours(0,0,0,0)),
        $lte: new Date(new Date(appointmentDate).setUTCHours(23,59,59,999))
      },
      timeSlot,
      status: { $in: ['Pending', 'Approved', 'Completed'] }
    });

    if (existing.length > 0) {
      throw new AppError('This time slot is already booked for this doctor on this day', 400);
    }

    const appointment = await AppointmentRepository.create({
      patientId: patientUserId,
      doctorId,
      appointmentDate,
      timeSlot,
      reason,
      status: 'Pending'
    });

    const patientUser = await UserRepository.findById(patientUserId);

    // Notify doctor
    await NotificationRepository.create({
      recipientId: doctorId,
      title: 'New Appointment Request',
      message: `Patient ${patientUser.name} requested an appointment for ${appointmentDate} at ${timeSlot}.`
    });

    await ActivityLogRepository.create(patientUserId, `Booked appointment with doctor ${doctor.userId.name}`);

    return appointment;
  }

  async getAppointments(user, filters = {}) {
    const query = {};

    if (user.role === 'Patient') {
      query.patientId = user.id;
    } else if (user.role === 'Doctor') {
      query.doctorId = user.id;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.date) {
      const d = new Date(filters.date);
      query.appointmentDate = {
        $gte: new Date(d.setUTCHours(0,0,0,0)),
        $lte: new Date(d.setUTCHours(23,59,59,999))
      };
    }

    let appointments = await AppointmentRepository.findAll(query);

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      appointments = appointments.filter(app => {
        const docName = app.doctorId ? app.doctorId.name : '';
        const patName = app.patientId ? app.patientId.name : '';
        return searchRegex.test(docName) || searchRegex.test(patName);
      });
    }

    return appointments;
  }

  async getAppointmentById(id, user) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Role Guard Check
    if (user.role === 'Patient' && appointment.patientId._id.toString() !== user.id) {
      throw new AppError('Unauthorized access to this appointment', 403);
    }
    if (user.role === 'Doctor' && appointment.doctorId._id.toString() !== user.id) {
      throw new AppError('Unauthorized access to this appointment', 403);
    }

    return appointment;
  }

  async updateAppointmentStatus(id, status, notesOrReason, user) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const { role, id: userId } = user;

    // Validate permission and state change transitions
    if (role === 'Patient') {
      if (appointment.patientId._id.toString() !== userId) {
        throw new AppError('Unauthorized', 403);
      }
      if (status !== 'Cancelled') {
        throw new AppError('Patients can only cancel appointments', 400);
      }
      if (appointment.status === 'Cancelled' || appointment.status === 'Completed') {
        throw new AppError('Cannot cancel a completed or already cancelled appointment', 400);
      }
    } else if (role === 'Doctor') {
      if (appointment.doctorId._id.toString() !== userId) {
        throw new AppError('Unauthorized', 403);
      }
      if (!['Approved', 'Rejected', 'Completed'].includes(status)) {
        throw new AppError('Invalid action for Doctors', 400);
      }
    } else if (role !== 'Admin') {
      throw new AppError('Unauthorized', 403);
    }

    const prevStatus = appointment.status;
    appointment.status = status;

    if (status === 'Rejected') {
      if (!notesOrReason) {
        throw new AppError('Rejection reason is required', 400);
      }
      appointment.rejectionReason = notesOrReason;
    }

    await appointment.save();

    // Log Activity & Create Notifications
    await ActivityLogRepository.create(userId, `Updated appointment ${id} status from ${prevStatus} to ${status}`);

    if (role === 'Doctor' || role === 'Admin') {
      // Notify Patient
      await NotificationRepository.create({
        recipientId: appointment.patientId._id,
        title: `Appointment Status: ${status}`,
        message: `Your appointment with Dr. ${appointment.doctorId.name} on ${appointment.appointmentDate.toDateString()} is ${status}.${status === 'Rejected' ? ' Reason: ' + notesOrReason : ''}`
      });
    } else if (role === 'Patient') {
      // Notify Doctor
      await NotificationRepository.create({
        recipientId: appointment.doctorId._id,
        title: `Appointment Cancelled`,
        message: `Patient ${appointment.patientId.name} cancelled their appointment on ${appointment.appointmentDate.toDateString()}.`
      });
    }

    return appointment;
  }

  async updateConsultationNotes(id, consultationNotes, doctorUserId) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.doctorId._id.toString() !== doctorUserId) {
      throw new AppError('Unauthorized to add notes to this appointment', 403);
    }

    appointment.consultationNotes = consultationNotes;
    appointment.status = 'Completed'; // Automatically mark completed when notes are written
    await appointment.save();

    await ActivityLogRepository.create(doctorUserId, `Completed appointment ${id} with consultation notes`);

    // Notify patient
    await NotificationRepository.create({
      recipientId: appointment.patientId._id,
      title: 'Consultation Notes Added',
      message: `Dr. ${appointment.doctorId.name} has added consultation notes for your appointment on ${appointment.appointmentDate.toDateString()}.`
    });

    return appointment;
  }

  async rescheduleAppointment(id, newDate, newSlot, user) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Auth validation
    if (user.role === 'Patient' && appointment.patientId._id.toString() !== user.id) {
      throw new AppError('Unauthorized', 403);
    }
    if (user.role === 'Doctor' && appointment.doctorId._id.toString() !== user.id) {
      throw new AppError('Unauthorized', 403);
    }

    // Verify doctor availability for the new slot
    const doctor = await DoctorRepository.findByUserId(appointment.doctorId._id);
    const dateObj = new Date(newDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const appointmentDay = days[dateObj.getDay()];

    if (!doctor.availability.workingDays.includes(appointmentDay)) {
      throw new AppError(`Doctor does not work on ${appointmentDay}s`, 400);
    }
    if (!doctor.availability.timeSlots.includes(newSlot)) {
      throw new AppError('Invalid time slot selected', 400);
    }

    // Check collision
    const existing = await AppointmentRepository.findAll({
      doctorId: appointment.doctorId._id,
      appointmentDate: {
        $gte: new Date(new Date(newDate).setUTCHours(0,0,0,0)),
        $lte: new Date(new Date(newDate).setUTCHours(23,59,59,999))
      },
      timeSlot: newSlot,
      status: { $in: ['Pending', 'Approved', 'Completed'] },
      _id: { $ne: id }
    });

    if (existing.length > 0) {
      throw new AppError('This time slot is already booked for this doctor on this day', 400);
    }

    const prevDate = appointment.appointmentDate;
    const prevSlot = appointment.timeSlot;

    appointment.appointmentDate = newDate;
    appointment.timeSlot = newSlot;
    // Set back to Pending if rescheduled by patient, else set Approved if by Doctor/Admin
    appointment.status = user.role === 'Patient' ? 'Pending' : 'Approved';
    await appointment.save();

    await ActivityLogRepository.create(user.id, `Rescheduled appointment ${id} to ${newDate} at ${newSlot}`);

    // Notifications
    if (user.role === 'Patient') {
      await NotificationRepository.create({
        recipientId: appointment.doctorId._id,
        title: 'Appointment Rescheduled',
        message: `Patient ${user.name} rescheduled appointment from ${prevDate.toDateString()} (${prevSlot}) to ${new Date(newDate).toDateString()} at ${newSlot}.`
      });
    } else {
      await NotificationRepository.create({
        recipientId: appointment.patientId._id,
        title: 'Appointment Rescheduled by Doctor',
        message: `Dr. ${user.name} rescheduled your appointment to ${new Date(newDate).toDateString()} at ${newSlot}.`
      });
    }

    return appointment;
  }
}

module.exports = new AppointmentService();
