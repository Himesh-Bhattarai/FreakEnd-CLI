module.exports = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_BASE_URL}/auth/google/callback`,
    scope: ['profile', 'email'],
    state: true, // CSRF protection
    accessType: 'offline', // For refresh tokens
    prompt: 'consent' // Force consent screen
  };