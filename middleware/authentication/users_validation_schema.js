const Joi = require('joi');

const registerSchema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().min(10).required(),
    mobile: Joi.number().min(10).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    church_name: Joi.string().required(),
    church_denomination: Joi.string().required(),
    church_address: Joi.string().required(),
    church_website: Joi.string().required(),
    church_id: Joi.string().required(),
    amount: Joi.number().required(),
    church_logo: Joi.string().required(),
    super: Joi.string().required(),
    password: Joi.string().alphanum().min(5).max(100).required(),
    isAdmin: Joi.boolean().required(),
    resetLink: Joi.string().default('').required(),
    status: Joi.string().default(0).required(),
});

const registerSuperSchema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().min(10).required(),
    mobile: Joi.number().min(10).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    password: Joi.string().alphanum().min(5).max(100).required(),
    isAdmin: Joi.boolean().required(),
    resetLink: Joi.string().default('').required(),
    status: Joi.string().default(0).required(),
});

const loginSchema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(50).required(),
    password: Joi.string().alphanum().min(5).max(100).required(),
});

const changePasswordSchema = Joi.object().keys({
    oldPassword: Joi.string().alphanum().min(5).max(100).required(),
    newPassword: Joi.string().alphanum().min(5).max(100).required(),
    confirmPassword: Joi.string().alphanum().min(5).max(100).required(),
});

module.exports ={ registerSchema,registerSuperSchema, loginSchema, changePasswordSchema }