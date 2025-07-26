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
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  };

  try {
    const { refreshToken } = req.cookies;

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);


    if (!refreshToken) {
      console.log('No refresh token found');
      return res.status(200).json({
        success: true,
        message: 'Already logged out or no session active.',
      });
    }

    try {
      console.log('Verifying refresh token...');
      const decoded = await tokenService.verifyRefreshToken(refreshToken);
      console.log('Refresh token decoded:', decoded);

      await tokenService.removeRefreshToken(refreshToken);
      console.log('Refresh token removed');
    } catch (err) {
      console.warn('Refresh token invalid or already removed:', err.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Logged out with fallback. Session forcibly ended.',
    });
  }
};

//Logout all devices for a user
exports.logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Logging out all devices for user:', userId);

    // Just remove the refreshTokens update for now if it's unnecessary
    const updatedUser = await User.findById(userId);

    // Make sure tokenVersion is a number before incrementing
    if (typeof updatedUser.tokenVersion !== 'number') {
      updatedUser.tokenVersion = 0;
    }

    updatedUser.tokenVersion += 1;
    updatedUser.refreshTokens = []; // optional

    await updatedUser.save();

    console.log('Updated tokenVersion:', updatedUser.tokenVersion);

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    console.error('Logout all devices error:', error);
    return res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

exports.switchAccount = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const { email, username } = req.body;

    console.log("User trying to switch from ID:", currentUserId);
    console.log("Switch target email:", email);
    console.log("Switch target username:", username);

    if (!email || !username) {
      return res.status(400).json({ message: "Email and username are required" });
    }

    // Find the target user to switch to
    const targetUser = await User.findOne({
      email: email.toLowerCase(),
      username
    });

    if (!targetUser) {
      console.log("Switch target user NOT found");
      return res.status(404).json({ message: "User to switch not found" });
    }

    // OPTIONAL: Add permission checks here if you want to restrict switching

    // Generate new tokens for target user
    const tokens = await tokenService.generateTokens(targetUser, req);

    // Set cookies with new tokens
    res.cookie("accessToken", tokens.access.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", tokens.refresh.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log(`Switched to user: ${targetUser.username}`);

    return res.json({
      success: true,
      message: `Switched to ${targetUser.username}`,
      user: {
        id: targetUser._id,
        email: targetUser.email,
        username: targetUser.username,
      },
    });
  } catch (error) {
    console.error("Switch account error:", error);
    return res.status(500).json({ message: "Account switch failed" });
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