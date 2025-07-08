const { versionConfig } = require('../config/versions');
const { sendError } = require('../utils/responseHandler');

const detectVersion = (req, res, next) => {
  let version = null;

  // Priority 1: URL parameter (/api/v1/users)
  const urlVersion = req.originalUrl.match(/\/api\/(v\d+)/);
  if (urlVersion) {
    version = urlVersion[1];
  }

  // Priority 2: x-api-version header
  if (!version && req.headers['x-api-version']) {
    version = req.headers['x-api-version'];
  }

  // Priority 3: Accept-Version header
  if (!version && req.headers['accept-version']) {
    version = req.headers['accept-version'];
  }

  // Priority 4: Default version
  if (!version) {
    version = versionConfig.default;
  }

  // Ensure version has 'v' prefix
  if (version && !version.startsWith('v')) {
    version = `v${version}`;
  }

  req.apiVersion = version;
  next();
};

module.exports = {
  detectVersion
};