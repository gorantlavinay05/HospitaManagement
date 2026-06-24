const Appointment = require('../models/Appointment');

class AppointmentRepository {
  async create(appointmentData) {
    const appointment = new Appointment(appointmentData);
    return await appointment.save();
  }

  async findById(id) {
    return await Appointment.findById(id)
      .populate('patientId', 'name email phone profileImage')
      .populate('doctorId', 'name email phone profileImage');
  }

  async update(id, updateData) {
    return await Appointment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('patientId', 'name email phone profileImage')
      .populate('doctorId', 'name email phone profileImage');
  }

  async delete(id) {
    return await Appointment.findByIdAndDelete(id);
  }

  async findAll(filter = {}) {
    return await Appointment.find(filter)
      .populate('patientId', 'name email phone profileImage')
      .populate('doctorId', 'name email phone profileImage')
      .sort({ appointmentDate: -1, timeSlot: 1 });
  }

  async count(filter = {}) {
    return await Appointment.countDocuments(filter);
  }
}

module.exports = new AppointmentRepository();
