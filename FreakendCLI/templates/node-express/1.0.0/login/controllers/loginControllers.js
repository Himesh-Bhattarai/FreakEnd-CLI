const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { generateTokens } = require('../../services/token.service');

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    user.refreshTokens.push({
      token: refreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};