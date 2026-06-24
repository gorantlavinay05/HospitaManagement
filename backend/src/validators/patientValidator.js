const Joi = require('joi');

const updatePatientSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string(),
  gender: Joi.string().valid('Male', 'Female', 'Other'),
  dob: Joi.date().iso(),
  bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  address: Joi.string().min(5),
  emergencyContact: Joi.object({
    name: Joi.string(),
    phone: Joi.string(),
    relation: Joi.string()
  }),
  profileImage: Joi.string().allow('')
});

module.exports = {
  updatePatientSchema
};
