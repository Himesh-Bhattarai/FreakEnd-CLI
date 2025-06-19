const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const tokenService = require('../services/token.service');
const userService = require('../services/user.service');

const register = async (req, res, next) => {
  try {
    if (await User.isEmailTaken(req.body.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user, tokens });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await tokenService.invalidateToken(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const refreshTokens = async (req, res, next) => {
  try {
    const tokens = await tokenService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
};