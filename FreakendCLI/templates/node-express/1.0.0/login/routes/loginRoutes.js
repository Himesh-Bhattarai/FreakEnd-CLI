const express = require('express');
const router = express.Router();
const { loginUser } = require('./login.controller');
const { validateLoginInput } = require('./login.middleware');

router.post('/', validateLoginInput, loginUser);

module.exports = router;