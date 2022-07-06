const Joi = require('joi');

const welfareSchema = Joi.object().keys({
    email: Joi.string().email().min(10).required(),
    mobile: Joi.number().min(10).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    request_details: Joi.string().required(),
    memberId: Joi.string(),
});

module.exports = { welfareSchema }