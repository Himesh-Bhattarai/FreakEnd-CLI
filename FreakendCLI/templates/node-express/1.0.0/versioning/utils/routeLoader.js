const fs = require('fs');
const path = require('path');
const { versionConfig } = require('../config/versions');

const loadRoutes = (app, versionsPath) => {
  console.log('🔄 Loading API routes...');
  
  versionConfig.supported.forEach(version => {
    const versionPath = path.join(versionsPath, version);
    const routesPath = path.join(versionPath, 'routes');
    
    if (!fs.existsSync(routesPath)) {
      console.warn(`⚠️  Routes directory not found for ${version}: ${routesPath}`);
      return;
    }

    // Load all route files in the version directory
    const routeFiles = fs.readdirSync(routesPath).filter(file => 
      file.endsWith('.js') && file !== 'index.js'
    );

    routeFiles.forEach(file => {
      try {
        const routePath = path.join(routesPath, file);
        const route = require(routePath);
        
        // Mount routes under versioned path
        app.use(`/api/${version}`, route);
        
        console.log(`✅ Loaded ${version} routes from ${file}`);
      } catch (error) {
        console.error(`❌ Error loading ${version} route ${file}:`, error.message);
      }
    });
  });
  
  console.log('🚀 All routes loaded successfully!');
};

const getAvailableVersions = () => {
  return versionConfig.supported.map(version => ({
    version,
    deprecated: require('../config/versions').isVersionDeprecated(version),
    disabled: require('../config/versions').isVersionDisabled(version)
  }));
};

module.exports = {
  loadRoutes,
  getAvailableVersions
};