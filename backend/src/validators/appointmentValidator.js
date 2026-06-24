const Joi = require('joi');

const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  appointmentDate: Joi.date().iso().required(),
  timeSlot: Joi.string().required(),
  reason: Joi.string().required().min(3).max(500)
});

const rescheduleAppointmentSchema = Joi.object({
  appointmentDate: Joi.date().iso().required(),
  timeSlot: Joi.string().required()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed').required(),
  reason: Joi.string().allow('').max(500) // For rejection reasons
});

const consultationNotesSchema = Joi.object({
  consultationNotes: Joi.string().required().min(1).max(5000)
});

module.exports = {
  bookAppointmentSchema,
  rescheduleAppointmentSchema,
  updateStatusSchema,
  consultationNotesSchema
};
