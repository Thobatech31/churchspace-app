const Joi = require('joi');

const churchGroupSchema = Joi.object().keys({
    group: Joi.string().required(),
    description: Joi.string().required(),
});

module.exports ={ churchGroupSchema }