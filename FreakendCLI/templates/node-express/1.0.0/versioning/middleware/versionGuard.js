const { 
    isVersionSupported, 
    isVersionDeprecated, 
    isVersionDisabled,
    getLatestVersion 
  } = require('../config/versions');
  const { sendError } = require('../utils/responseHandler');
  
  const versionGuard = (req, res, next) => {
    const version = req.apiVersion;
  
    // Check if version is disabled
    if (isVersionDisabled(version)) {
      return sendError(res, 410, `API version ${version} is no longer available`);
    }
  
    // Check if version is supported
    if (!isVersionSupported(version)) {
      return sendError(res, 400, `API version ${version} is not supported. Supported versions: ${require('../config/versions').versionConfig.supported.join(', ')}`);
    }
  
    // Add deprecation warning for deprecated versions
    if (isVersionDeprecated(version)) {
      res.set('X-API-Deprecated', 'true');
      res.set('X-API-Deprecation-Warning', `API version ${version} is deprecated. Please upgrade to ${getLatestVersion()}`);
    }
  
    // Add version info to response headers
    res.set('X-API-Version', version);
    
    next();
  };
  
  module.exports = {
    versionGuard
  };