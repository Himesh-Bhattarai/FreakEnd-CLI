const axios = require('axios');
const { OAuthAccount, User } = require('../models');
const { tokenService } = require('./token.service');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

class OAuthService {
  constructor(provider) {
    this.provider = provider;
  }

  async authenticate(accessToken, profile) {
    try {
      const email = this.getEmailFromProfile(profile);
      
      if (!email) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No email found in OAuth profile');
      }

      // Find or create user
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          email,
          isEmailVerified: true
        });
      }

      // Create or update OAuth account
      await OAuthAccount.findOneAndUpdate(
        { provider: this.provider, user: user.id },
        {
          providerId: profile.id,
          accessToken,
          expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour expiration
        },
        { upsert: true, new: true }
      );

      // Generate application tokens
      return tokenService.generateAuthTokens(user);
    } catch (error) {
      logger.error(`OAuth ${this.provider} authentication failed: ${error.message}`);
      throw error;
    }
  }

  getEmailFromProfile(profile) {
    switch (this.provider) {
      case 'google':
      case 'facebook':
        return profile.emails?.[0]?.value;
      case 'github':
        return profile.emails?.find(e => e.primary)?.email || profile.emails?.[0]?.email;
      default:
        return profile.email;
    }
  }

  async refreshToken(refreshToken) {
    let newTokenResponse;
    
    try {
      switch (this.provider) {
        case 'google':
          newTokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
          });
          break;
        case 'facebook':
          // Facebook doesn't use refresh tokens
          throw new ApiError(httpStatus.BAD_REQUEST, 'Facebook does not support refresh tokens');
        default:
          throw new ApiError(httpStatus.BAD_REQUEST, 'Provider not supported for token refresh');
      }

      return newTokenResponse.data.access_token;
    } catch (error) {
      logger.error(`OAuth ${this.provider} token refresh failed: ${error.message}`);
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Failed to refresh OAuth token');
    }
  }
}

module.exports = {
  googleOAuthService: new OAuthService('google'),
  facebookOAuthService: new OAuthService('facebook'),
  githubOAuthService: new OAuthService('github'),
  customOAuthService: new OAuthService('custom')
};