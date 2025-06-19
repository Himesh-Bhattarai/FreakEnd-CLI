const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth');
const config = require('../../config/oauth/google');
const { OAuthAccount, User } = require('../../models');
const { tokenService } = require('../../services');

const strategy = new GoogleStrategy(
  config,
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      
      if (!email) {
        return done(new Error('Google account has no email address'));
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
        { provider: 'google', user: user.id },
        {
          providerId: profile.id,
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour expiration
        },
        { upsert: true, new: true }
      );

      // Generate application tokens
      const tokens = await tokenService.generateAuthTokens(user);

      return done(null, { user, tokens });
    } catch (error) {
      return done(error);
    }
  }
);

module.exports = strategy;