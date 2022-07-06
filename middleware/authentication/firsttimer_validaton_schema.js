const Joi = require('joi');

const firsttimerSchema = Joi.object().keys({
    email: Joi.string().email().min(10).required(),
    mobile: Joi.number().min(10).required(),
    alternative_mobile: Joi.number(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().required(),
    dob: Joi.string(),
    date_joined: Joi.string(),
    occupation: Joi.string(),
    home_address: Joi.string(),
    office_address: Joi.string(),
    ministerId: Joi.string(),
    memberId: Joi.string(),
});

module.exports = { firsttimerSchema }