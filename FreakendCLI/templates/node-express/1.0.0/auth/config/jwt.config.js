module.exports = {
  jwt: {
      accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret',
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
      accessTokenExpires: 15 * 60, // 15 minutes in seconds
      refreshTokenExpires: 7 * 24 * 60 * 60 // 7 days in seconds
  },
  env: process.env.NODE_ENV || 'development'
};