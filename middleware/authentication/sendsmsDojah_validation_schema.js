const Joi = require('joi');

const customSmsSchema = Joi.object().keys({
  mobile: Joi.number().required(),
  sender_id: Joi.string().required(),
  message: Joi.string().required(),
});

const sendSmsSchema = Joi.object().keys({
  amount: Joi.number().required(),
  tithe_giver_type: Joi.string().required(),
  offering_date: Joi.string().required(),
});

module.exports = { customSmsSchema, sendSmsSchema }