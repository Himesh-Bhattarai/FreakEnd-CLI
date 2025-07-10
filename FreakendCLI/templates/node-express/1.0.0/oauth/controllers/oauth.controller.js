const passport = require('../config/oauth.config');
const OAuthUser = require('../models/oauth.model');
const OAuthUtils = require('../utils/oauth.utils');

class OAuthController {
  /**
   * Initiate OAuth authentication
   */
  static async initiateAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const { redirect_uri } = req.query;

      // Validate provider
      const validProviders = ['github', 'facebook', 'google'];
      if (!validProviders.includes(provider)) {
        return res.status(400).json(
          OAuthUtils.createErrorResponse('invalid_provider', 'Invalid OAuth provider')
        );
      }

      // Generate and store state for security
      const state = OAuthUtils.generateState();
      req.session.oauthState = state;
      
      // Store redirect URI in session
      if (redirect_uri) {
        req.session.redirectUri = redirect_uri;
      }

      // Set strategy-specific options
      const authOptions = {
        state,
        session: false
      };

      // Provider-specific scopes
      switch (provider) {
        case 'github':
          authOptions.scope = ['user:email'];
          break;
        case 'facebook':
          authOptions.scope = ['email'];
          break;
        case 'google':
          authOptions.scope = ['profile', 'email'];
          break;
      }

      passport.authenticate(provider, authOptions)(req, res, next);
    } catch (error) {
      console.error('OAuth initiation error:', error);
      res.status(500).json(
        OAuthUtils.createErrorResponse('server_error', 'Failed to initiate OAuth')
      );
    }
  }

  /**
   * Handle OAuth callback
   */
  static async handleCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { error, error_description } = req.query;

      // Check for OAuth errors
      if (error) {
        const errorUrl = `${process.env.FRONTEND_ERROR_URL}&error=${error}&description=${error_description}`;
        return res.redirect(errorUrl);
      }

      passport.authenticate(provider, { session: false }, async (err, user, info) => {
        try {
          if (err) {
            console.error('OAuth callback error:', err);
            return res.redirect(`${process.env.FRONTEND_ERROR_URL}&error=oauth_error`);
          }

          if (!user) {
            return res.redirect(`${process.env.FRONTEND_ERROR_URL}&error=auth_failed`);
          }

          // Update login statistics
          user.updateLoginStats(
            OAuthUtils.getClientIP(req),
            req.get('User-Agent')
          );
          await user.save();

          // Generate JWT token
          const token = OAuthUtils.generateJWT(user);

          // Get redirect URL from session or use default
          const redirectUrl = req.session.redirectUri || process.env.FRONTEND_SUCCESS_URL;
          
          // Clear session data
          delete req.session.redirectUri;
          delete req.session.oauthState;

          // Redirect with token
          const finalUrl = `${redirectUrl}?token=${token}&provider=${provider}`;
          res.redirect(finalUrl);
        } catch (callbackError) {
          console.error('OAuth callback processing error:', callbackError);
          res.redirect(`${process.env.FRONTEND_ERROR_URL}&error=callback_error`);
        }
      })(req, res, next);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_ERROR_URL}&error=server_error`);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const user = await OAuthUser.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json(
          OAuthUtils.createErrorResponse('user_not_found', 'User not found')
        );
      }

      res.json(
        OAuthUtils.createSuccessResponse(
          OAuthUtils.formatUserResponse(user),
          'Profile retrieved successfully'
        )
      );
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json(
        OAuthUtils.createErrorResponse('server_error', 'Failed to retrieve profile')
      );
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const { fullName, preferences } = req.body;
      const user = await OAuthUser.findById(req.user.id);

      if (!user) {
        return res.status(404).json(
          OAuthUtils.createErrorResponse('user_not_found', 'User not found')
        );
      }

      // Update allowed fields
      if (fullName) {
        user.fullName = fullName.trim();
      }

      if (preferences) {
        user.preferences = { ...user.preferences, ...preferences };
      }

      await user.save();

      res.json(
        OAuthUtils.createSuccessResponse(
          OAuthUtils.formatUserResponse(user),
          'Profile updated successfully'
        )
      );
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json(
        OAuthUtils.createErrorResponse('server_error', 'Failed to update profile')
      );
    }
  }

  /**
   * Link additional OAuth provider
   */
  static async linkProvider(req, res) {
    try {
      const { provider } = req.params;
      const user = await OAuthUser.findById(req.user.id);

      if (!user) {
        return res.status(404).json(
          OAuthUtils.createErrorResponse('user_not_found', 'User not found')
        );
      }

      if (user.hasOAuthProvider(provider)) {
        return res.status(400).json(
          OAuthUtils.createErrorResponse('provider_already_linked', 'Provider already linked')
        );
      }

      // Store user ID in session for linking
      req.session.linkUserId = user.id;
      
      res.json(
        OAuthUtils.createSuccessResponse(
          {
            linkUrl: `/api/oauth/${provider}?link=true`,
            message: `Redirect to this URL to link your ${provider} account`
          },
          'Link URL generated'
        )
      );
    } catch (error) {
      console.error('Link provider error:', error);
      res.status(500).json(
        OAuthUtils.createErrorResponse('server_error', 'Failed to generate link URL')
      );
    }
  }

  /**
   * Unlink OAuth provider
   */
  static async unlinkProvider(req, res) {
    try {
      const { provider } = req.params;
      const user = await OAuthUser.findById(req.user.id);

      if (!user) {
        return res.status(404).json(
          OAuthUtils.createErrorResponse('user_not_found', 'User not found')
        );
      }

      if (!user.hasOAuthProvider(provider)) {
        return res.status(400).json(
          OAuthUtils.createErrorResponse('provider_not_linked', 'Provider not linked')
        );
      }

      // Prevent unlinking if it's the only provider
      if (user.oauthProviders.length === 1) {
        return res.status(400).json(
          OAuthUtils.createErrorResponse('cannot_unlink_last_provider', 'Cannot unlink the last authentication method')
        );
      }

      user.removeOAuthProvider(provider);
      await user.save();

      res.json(
        OAuthUtils.createSuccessResponse(
          OAuthUtils.formatUserResponse(user),
          `${provider} account unlinked successfully`
        )
      );
    } catch (error) {
      console.error('Unlink provider error:', error);
      res.status(500).json(
        OAuthUtils.createErrorResponse('server_error', 'Failed to unlink provider')
      );
    }
  }

  /**
   * Get user's OAuth connections
   */
  static async getConnections(req, res) {
    try {
      const user = await OAuthUser.findById(req.user.id);

      if (!user) {
        return res.status(404).json(
          OAuthUtils.createErrorResponse('user_not_found', 'User not found')
        );
      }

      const connections = user.oauthProviders.map(provider => ({
        provider: provider.provider,
        connectedAt: provider.connectedAt,
        isActive: true
      }));

      res.json(
        OAuthUtils.createSuccessResponse(
          { connections },
          'OAuth connections retrieved successfully'
        )
      );
    } catch (error) {
      console.error('Get connections error:', error);
      res.status(500).json(
        OAuthUtils.createErrorResponse('server_error', 'Failed to retrieve connections')
      );
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(req, res) {
    try {
      const { confirmPassword } = req.body;
      const user = await OAuthUser.findById(req.user.id);

      if (!user) {
        return res.status(404).json(
          OAuthUtils.createErrorResponse('user_not_found', 'User not found')
        );
      }

      // For OAuth-only accounts, we'll require confirmation text
      if (confirmPassword !== 'DELETE_MY_ACCOUNT') {
        return res.status(400).json(
          OAuthUtils.createErrorResponse('invalid_confirmation', 'Please type "DELETE_MY_ACCOUNT" to confirm')
        );
      }

      // Soft delete - mark as inactive
      user.isActive = false;
      user.email = `deleted_${Date.now()}@deleted.com`;
      user.username = `deleted_${Date.now()}`;
      await user.save();

      res.json(
        OAuthUtils.createSuccessResponse(
          null,
          'Account deleted successfully'
        )
      );
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json(
        OAuthUtils.createErrorResponse('server_error', 'Failed to delete account')
      );
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(req, res) {
    try {
      const user = await OAuthUser.findById(req.user.id);

      if (!user || !user.isActive) {
        return res.status(401).json(
          OAuthUtils.createErrorResponse('unauthorized', 'Invalid user')
        );
      }

      const newToken = OAuthUtils.generateJWT(user);

      res.json(
        OAuthUtils.createSuccessResponse(
          { token: newToken },
          'Token refreshed successfully'
        )
      );
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json(
        OAuthUtils.createErrorResponse('server_error', 'Failed to refresh token')
      );
    }
  }

  /**
   * Get OAuth statistics (admin only)
   */
  static async getStats(req, res) {
    try {
      const stats = await OAuthUser.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
            verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
            avgLoginCount: { $avg: '$loginCount' }
          }
        }
      ]);

      const providerStats = await OAuthUser.aggregate([
        { $unwind: '$oauthProviders' },
        {
          $group: {
            _id: '$oauthProviders.provider',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json(
        OAuthUtils.createSuccessResponse(
          {
            userStats: stats[0] || {},
            providerStats: providerStats.reduce((acc, stat) => {
              acc[stat._id] = stat.count;
              return acc;
            }, {})
          },
          'OAuth statistics retrieved successfully'
        )
      );
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json(
        OAuthUtils.createErrorResponse('server_error', 'Failed to retrieve statistics')
      );
    }
  }
}

module.exports = OAuthController;