module.exports = {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.API_BASE_URL}/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    scope: ['email', 'public_profile'],
    state: true, // CSRF protection
    enableProof: true // Enable appsecret_proof
  };