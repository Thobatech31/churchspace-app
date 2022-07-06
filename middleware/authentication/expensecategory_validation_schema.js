const Joi = require('joi');

const expenseCategorySchema = Joi.object().keys({
    expense_name: Joi.string().required(),
    expense_description: Joi.string().required(),
});

module.exports ={ expenseCategorySchema }