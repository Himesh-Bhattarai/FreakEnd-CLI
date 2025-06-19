const Joi = require('joi');
const { password } = require('./custom.validation');

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required()
  })
};

const resetPassword = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().required().custom(password)
  })
};

module.exports = {
  forgotPassword,
  resetPassword
};