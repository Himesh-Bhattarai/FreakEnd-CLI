const supportedVersions = (process.env.SUPPORTED_VERSIONS || 'v1,v2').split(',').map(v => v.trim());
const deprecatedVersions = (process.env.DEPRECATED_VERSIONS || '').split(',').map(v => v.trim()).filter(Boolean);
const disabledVersions = (process.env.DISABLED_VERSIONS || '').split(',').map(v => v.trim()).filter(Boolean);
const defaultVersion = process.env.DEFAULT_API_VERSION || 'v1';

const versionConfig = {
  supported: supportedVersions,
  deprecated: deprecatedVersions,
  disabled: disabledVersions,
  default: defaultVersion,
  enforcement: process.env.VERSION_ENFORCEMENT === 'true'
};

const isVersionSupported = (version) => {
  return versionConfig.supported.includes(version);
};

const isVersionDeprecated = (version) => {
  return versionConfig.deprecated.includes(version);
};

const isVersionDisabled = (version) => {
  return versionConfig.disabled.includes(version);
};

const getLatestVersion = () => {
  return versionConfig.supported[versionConfig.supported.length - 1];
};

module.exports = {
  versionConfig,
  isVersionSupported,
  isVersionDeprecated,
  isVersionDisabled,
  getLatestVersion
};