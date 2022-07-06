const Joi = require('joi');

const departmentSchema = Joi.object().keys({
    department: Joi.string().required(),
    description: Joi.string().required(),
    ministerId: Joi.string().required(),
    memberId: Joi.string().required(),
});

module.exports = { departmentSchema }