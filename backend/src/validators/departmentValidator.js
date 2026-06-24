const Joi = require('joi');

const departmentSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().required().min(5).max(1000)
});

module.exports = {
  departmentSchema
};
