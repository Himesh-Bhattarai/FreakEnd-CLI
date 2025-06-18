const express = require('express');
const router = express.Router();
const { logoutUser } = require('./logout.controller');
const { verifyRefreshToken } = require('../../services/auth.service');

router.post('/', verifyRefreshToken, logoutUser);

module.exports = router;