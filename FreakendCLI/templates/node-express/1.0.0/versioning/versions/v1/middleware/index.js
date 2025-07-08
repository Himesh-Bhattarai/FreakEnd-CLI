// V1 specific middleware can be added here
const v1Middleware = (req, res, next) => {
  // Add V1 specific logic here
  req.apiFeatures = {
    maxPageSize: 50,
    supportedFilters: ['name', 'email'],
    version: 'v1'
  };
  next();
};

module.exports = {
  v1Middleware
};