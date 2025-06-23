const User = require('../models/universal.User.model');
const tokenService = require('../services/jwt.token.services');

const bcrypt = require('bcrypt');

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
      
      console.log('Before token generation');
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

    res.status(200).json({

      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};