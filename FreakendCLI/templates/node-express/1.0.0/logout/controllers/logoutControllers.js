const User = require('../../models/User');

exports.logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(204);
    
    const user = await User.findOne({ 'refreshTokens.token': refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(token => token.token !== refreshToken);
      await user.save();
    }
    
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};