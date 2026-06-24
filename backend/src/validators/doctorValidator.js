const Joi = require('joi');

const createDoctorSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  phone: Joi.string().required(),
  specialization: Joi.string().required(),
  qualification: Joi.string().required(),
  experience: Joi.number().min(0).required(),
  consultationFee: Joi.number().min(0).required(),
  departmentId: Joi.string().required(), // hex objectId string
  availability: Joi.object({
    workingDays: Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    timeSlots: Joi.array().items(Joi.string())
  })
});

const updateDoctorSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string(),
  specialization: Joi.string(),
  qualification: Joi.string(),
  experience: Joi.number().min(0),
  consultationFee: Joi.number().min(0),
  departmentId: Joi.string(),
  availability: Joi.object({
    workingDays: Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    timeSlots: Joi.array().items(Joi.string())
  }),
  profileImage: Joi.string().allow('')
});

module.exports = {
  createDoctorSchema,
  updateDoctorSchema
};
