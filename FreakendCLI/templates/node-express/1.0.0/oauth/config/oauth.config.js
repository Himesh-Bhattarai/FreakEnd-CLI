const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const OAuthUser = require('../models/oauth.model');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await OAuthUser.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists with this GitHub ID
    let user = await OAuthUser.findByOAuthProvider('github', profile.id);
    
    if (user) {
      // Update existing user
      user.addOAuthProvider('github', profile.id, {
        username: profile.username,
        profileUrl: profile.profileUrl,
        accessToken: accessToken
      });
      user.avatar = profile.photos[0]?.value || user.avatar;
      await user.save();
      return done(null, user);
    }

    // Check if user exists with same email
    const email = profile.emails[0]?.value;
    if (email) {
      user = await OAuthUser.findOne({ email });
      if (user) {
        // Link GitHub account to existing user
        user.addOAuthProvider('github', profile.id, {
          username: profile.username,
          profileUrl: profile.profileUrl,
          accessToken: accessToken
        });
        user.avatar = profile.photos[0]?.value || user.avatar;
        await user.save();
        return done(null, user);
      }
    }

    // Create new user
    user = new OAuthUser({
      email: email,
      username: profile.username || `github_${profile.id}`,
      fullName: profile.displayName || profile.username,
      avatar: profile.photos[0]?.value,
      isEmailVerified: true,
      oauthProviders: [{
        provider: 'github',
        providerId: profile.id,
        providerData: {
          username: profile.username,
          profileUrl: profile.profileUrl,
          accessToken: accessToken
        }
      }]
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'emails', 'name', 'picture.type(large)']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await OAuthUser.findByOAuthProvider('facebook', profile.id);
    
    if (user) {
      user.addOAuthProvider('facebook', profile.id, {
        profileUrl: `https://facebook.com/${profile.id}`,
        accessToken: accessToken
      });
      user.avatar = profile.photos[0]?.value || user.avatar;
      await user.save();
      return done(null, user);
    }

    const email = profile.emails[0]?.value;
    if (email) {
      user = await OAuthUser.findOne({ email });
      if (user) {
        user.addOAuthProvider('facebook', profile.id, {
          profileUrl: `https://facebook.com/${profile.id}`,
          accessToken: accessToken
        });
        user.avatar = profile.photos[0]?.value || user.avatar;
        await user.save();
        return done(null, user);
      }
    }

    user = new OAuthUser({
      email: email,
      username: `facebook_${profile.id}`,
      fullName: `${profile.name.givenName} ${profile.name.familyName}`,
      avatar: profile.photos[0]?.value,
      isEmailVerified: true,
      oauthProviders: [{
        provider: 'facebook',
        providerId: profile.id,
        providerData: {
          profileUrl: `https://facebook.com/${profile.id}`,
          accessToken: accessToken
        }
      }]
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await OAuthUser.findByOAuthProvider('google', profile.id);
    
    if (user) {
      user.addOAuthProvider('google', profile.id, {
        profileUrl: profile.profileUrl,
        accessToken: accessToken
      });
      user.avatar = profile.photos[0]?.value || user.avatar;
      await user.save();
      return done(null, user);
    }

    const email = profile.emails[0]?.value;
    if (email) {
      user = await OAuthUser.findOne({ email });
      if (user) {
        user.addOAuthProvider('google', profile.id, {
          profileUrl: profile.profileUrl,
          accessToken: accessToken
        });
        user.avatar = profile.photos[0]?.value || user.avatar;
        await user.save();
        return done(null, user);
      }
    }

    user = new OAuthUser({
      email: email,
      username: email.split('@')[0],
      fullName: profile.displayName,
      avatar: profile.photos[0]?.value,
      isEmailVerified: true,
      oauthProviders: [{
        provider: 'google',
        providerId: profile.id,
        providerData: {
          profileUrl: profile.profileUrl,
          accessToken: accessToken
        }
      }]
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

module.exports = passport;