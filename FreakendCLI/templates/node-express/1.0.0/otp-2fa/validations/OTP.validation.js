const { Joi } = require('../utils/validation');

const sendOtp = {
  body: Joi.object().keys({
    identifier: Joi.string().required(),
    type: Joi.string().valid('sms', 'email').required()
  })
};

const verifyOtp = {
  body: Joi.object().keys({
    identifier: Joi.string().required(),
    code: Joi.string().required().regex(/^\d{6}$/),
    type: Joi.string().valid('sms', 'email').required()
  })
};

const setup2fa = {
  body: Joi.object().keys({
    method: Joi.string().valid('sms', 'email', 'authenticator').required()
  })
};

const enable2fa = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    method: Joi.string().valid('sms', 'email', 'authenticator').required(),
    secret: Joi.when('method', {
      is: 'authenticator',
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),
    backupCodes: Joi.array().items(Joi.string()).min(1).required()
  })
};

const verify2fa = {
  body: Joi.object().keys({
    code: Joi.string().required()
  })
};

module.exports = {
  sendOtp,
  verifyOtp,
  setup2fa,
  enable2fa,
  verify2fa
};