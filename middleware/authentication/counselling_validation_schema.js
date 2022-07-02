const Joi = require('joi');

const counsellingSchema = Joi.object().keys({
    email: Joi.string().email().min(10).required(),
    mobile: Joi.number().min(10).required(),
    first_name: Joi.string().required(),
    address: Joi.string().required(),
    last_name: Joi.string().required(),
    counselling_prayerrequest: Joi.string().required(),
    firsttimerId: Joi.string().required(),
    memberId: Joi.string().required(),
});

module.exports = { counsellingSchema }