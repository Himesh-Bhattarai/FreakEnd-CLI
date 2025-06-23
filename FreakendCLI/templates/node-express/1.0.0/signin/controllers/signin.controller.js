const User = require('../models/universal.User.model');
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