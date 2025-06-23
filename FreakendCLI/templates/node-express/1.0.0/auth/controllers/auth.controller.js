const User = require('../models/universal.User.model');
const tokenService = require('../services/jwt.token.service');
const bcrypt = require('bcrypt');

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({ message: `${field} already exists` });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with hashed password
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, username, email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Initialize tokenVersion if it doesn't exist or is not a number
    if (typeof user.tokenVersion !== 'number' || isNaN(user.tokenVersion)) {
      user.tokenVersion = 0;
    }

    // Clean expired refresh tokens before adding new one
    user.refreshTokens = user.refreshTokens.filter(
      tokenObj => new Date(tokenObj.expires) > new Date()
    );

    // Save user to ensure tokenVersion is properly set before generating tokens
    await user.save();

    // Generate tokens (this also stores the hashed refresh token automatically)
    const tokens = await tokenService.generateTokens(user, req);

    // Set secure cookies
    res.cookie('accessToken', tokens.access.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', tokens.refresh.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

// Logout Controller
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Security: Always clear cookies regardless of token validity
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    // If no refresh token provided, user is already logged out
    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: 'Already logged out'
      });
    }

    // Validate and remove the refresh token
    try {
      await tokenService.verifyRefreshToken(refreshToken);
      await tokenService.removeRefreshToken(refreshToken);
    } catch (error) {
      // Token is invalid/expired - log but don't fail logout
    }

    // Always return success for logout (security best practice)
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    // Even on server error, clear cookies and return success
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};

// Logout All Devices Controller
exports.logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user.id;

    // Increment token version to invalidate all tokens
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { tokenVersion: 1 },
        $set: { refreshTokens: [] }
      },
      { new: true }
    );

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
};
// Switch Account Controller
exports.switchAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    const currentUser = req.user;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find the target user
    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent switching to same account
    if (currentUser.id === targetUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot switch to the same account'
      });
    }

    // Verify password for target account
    const isValidPassword = await bcrypt.compare(password, targetUser.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials for target account'
      });
    }

    // Optional: Check if user has permission to switch
    // You can implement business logic here
    const canSwitchTo = await checkSwitchPermission(currentUser.id, targetUser._id);
    if (!canSwitchTo) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to switch to this account'
      });
    }

    // Get current token from request
    const currentToken = req.token; // This should be set by your authenticateToken middleware

    // Remove current user's token
    await Token.deleteOne({ accessToken: currentToken });

    // Generate new tokens for target user
    const { accessToken, refreshToken } = await tokenService.generateTokens(targetUser, req);

    // Return tokens in response (better for API testing)
    res.json({
      success: true,
      message: 'Account switched successfully',
      user: {
        id: targetUser._id,
        email: targetUser.email,
        username: targetUser.username,
        name: targetUser.name
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Switch account error:', error);
    res.status(500).json({
      success: false,
      message: 'Account switch failed'
    });
  }
};

// Token refresh controller
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    // Verify the refresh token using the service
    const decoded = await tokenService.verifyRefreshToken(refreshToken);

    // Get the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // Remove the old refresh token before generating new ones
    await tokenService.removeRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = await tokenService.generateTokens(user, req);

    // Update both cookies
    res.cookie('accessToken', tokens.access.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', tokens.refresh.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token refresh failed' });
  }
};

// Helper function to check switch permissions
async function checkSwitchPermission(currentUserId, targetUserId) {
  // Implement your business logic here
  // Examples:
  // - Check if users are in same organization
  // - Check if current user is admin
  // - Check if target user has granted permission
  // - Check family/team relationships

  // For now, return true - replace with actual logic
  return true;
}