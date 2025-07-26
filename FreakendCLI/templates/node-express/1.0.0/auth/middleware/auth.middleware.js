
// Signup Validation
exports.validateSignup = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  next();
};

// Login Validation
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  next();
};

// Switch Account Validation
// Middleware validation example (optional)
// middleware/auth.middleware.js
exports.validateSwitchAccount = (req, res, next) => {
  const { newUserId, email, username } = req.body;

  if (!newUserId && !(email && username)) {
    return res.status(400).json({
      message: 'Either newUserId or both email and username are required to switch account'
    });
  }
  next();
};
