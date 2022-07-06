const Joi = require('joi');

const feedbackSchema = Joi.object().keys({
  feedback_message: Joi.string().required(),
});

module.exports = { feedbackSchema }