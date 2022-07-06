const Joi = require('joi');

const memberSchema = Joi.object().keys({
    email: Joi.string().email().min(10).required(),
    mobile: Joi.number().min(10).required(),
    alternative_mobile: Joi.number(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().required(),
    date_joined: Joi.string(),
    occupation: Joi.string(),
    home_address: Joi.string(),
    office_address: Joi.string(),
    mdepartment: Joi.array(),
    mchurch_group: Joi.array(),
});

module.exports = { memberSchema }