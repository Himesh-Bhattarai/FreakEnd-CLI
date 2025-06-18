const User = require('../models/User');
const { generateTokens } = require('../services/token.service');

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

    // Create user
    const user = new User({ username, email, password });
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
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    await user.save();

    // Set cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      user: { id: user._id, email: user.email, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Logout Controller
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(204);

    // Remove refresh token
    const user = await User.findOne({ 'refreshTokens.token': refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
      await user.save();
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

// Switch Account Controller
exports.switchAccount = async (req, res) => {
  try {
    const { newUserId } = req.body;
    const currentUser = req.user;

    if (currentUser.id === newUserId) {
      return res.status(400).json({ message: 'Cannot switch to same account' });
    }

    const newUser = await User.findById(newUserId);
    if (!newUser) return res.status(404).json({ message: 'User not found' });

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Remove old refresh token
    currentUser.refreshTokens = currentUser.refreshTokens.filter(
      t => t.token !== req.cookies.refreshToken
    );
    await currentUser.save();

    // Add new refresh token
    newUser.refreshTokens.push({
      token: refreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await newUser.save();

    // Set new cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      user: { id: newUser._id, email: newUser.email, username: newUser.username }
    });
  } catch (error) {
    res.status(500).json({ message: 'Account switch failed', error: error.message });
  }
};