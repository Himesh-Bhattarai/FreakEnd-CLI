const express = require('express');
const router = express.Router();
const { registerUser } = require('./signup.controller');
const { validateSignupInput } = require('./signup.middleware');

router.post('/', validateSignupInput, registerUser);

module.exports = router;