const httpStatus = require('http-status');
const passport = require('passport');
const { OAuthAccount } = require('../models');
const { 
  googleOAuthService,
  facebookOAuthService,
  githubOAuthService,
  customOAuthService
} = require('../services/oauth.service');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const oAuthCallback = (provider) => catchAsync(async (req, res, next) => {
  passport.authenticate(provider, { session: false }, async (err, data) => {
    try {
      if (err || !data) {
        throw new ApiError(httpStatus.UNAUTHORIZED, `Failed to authenticate with ${provider}`);
      }

      const { user, tokens } = data;
      
      // Set cookies if using cookie-based auth
      res.cookie('refreshToken', tokens.refresh.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: tokens.refresh.expiresIn * 1000,
        sameSite: 'strict'
      });

      res.status(httpStatus.OK).json({
        user,
        accessToken: tokens.access.token,
        accessTokenExpires: tokens.access.expires
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

const linkOAuthAccount = catchAsync(async (req, res) => {
  const { provider, accessToken } = req.body;
  
  let service;
  switch (provider) {
    case 'google':
      service = googleOAuthService;
      break;
    case 'facebook':
      service = facebookOAuthService;
      break;
    case 'github':
      service = githubOAuthService;
      break;
    case 'custom':
      service = customOAuthService;
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OAuth provider');
  }

  const profile = await service.getProfile(accessToken);
  await OAuthAccount.create({
    provider,
    providerId: profile.id,
    accessToken,
    user: req.user.id
  });

  res.status(httpStatus.CREATED).send({ success: true });
});

module.exports = {
  googleCallback: oAuthCallback('google'),
  facebookCallback: oAuthCallback('facebook'),
  githubCallback: oAuthCallback('github'),
  customCallback: oAuthCallback('custom'),
  linkOAuthAccount
};