// V2 specific middleware
const v2Middleware = (req, res, next) => {
  // Add V2 specific logic here
  req.apiFeatures = {
    maxPageSize: 100,
    supportedFilters: ['name', 'email', 'role', 'status'],
    version: 'v2',
    enhancedFeatures: true
  };
  next();
};

module.exports = {
  v2Middleware
};