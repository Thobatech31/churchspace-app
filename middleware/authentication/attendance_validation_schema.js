const Joi = require('joi');

const attendanceSchema = Joi.object().keys({
    service_title: Joi.string().required(),
    men_attd: Joi.number().required(),
    women_attd: Joi.number().required(),
    children_attd: Joi.number().required(),
    date_attendance: Joi.string().required(),
});

module.exports ={ attendanceSchema }