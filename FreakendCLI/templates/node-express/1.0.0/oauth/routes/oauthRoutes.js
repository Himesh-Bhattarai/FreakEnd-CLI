const express = require('express');
const passport = require('passport');
const authController = require('../controllers/oauth.controller');
const validate = require('../middlewares/validate');
const { authValidation } = require('../validations');

const router = express.Router();

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google')
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.googleCallback
);

// Facebook OAuth
router.get(
  '/facebook',
  passport.authenticate('facebook')
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  authController.facebookCallback
);

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github')
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  authController.githubCallback
);

// Custom OAuth
router.get(
  '/custom',
  passport.authenticate('custom')
);

router.get(
  '/custom/callback',
  passport.authenticate('custom', { failureRedirect: '/login', session: false }),
  authController.customCallback
);

// Link OAuth account to existing user
router.post(
  '/link-account',
  validate(authValidation.linkOAuthAccount),
  authController.linkOAuthAccount
);

module.exports = router;