const Joi = require('joi');

const offeringSchema = Joi.object().keys({
    amount: Joi.number().required(),
    type: Joi.string().required(),
    offering_date: Joi.string().required(),
});

const titheSchema = Joi.object().keys({
    amount: Joi.number().required(),
    tithe_giver_type: Joi.string().required(),
    offering_date: Joi.string().required(),
});


const expenseSchema = Joi.object().keys({
    amount: Joi.number().required(),
    remark: Joi.string().required(),
    offering_date: Joi.string().required(),
    expenseCatoryId: Joi.string().required(),
});


module.exports = { offeringSchema, titheSchema, expenseSchema }