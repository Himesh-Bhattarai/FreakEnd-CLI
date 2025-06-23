const fs = require('fs-extra');
const path = require('path');

function createSandboxedTemplate() {
    const original = path.resolve('./templates/node-express/1.0.0');
    const sandbox = path.resolve('./__test-temp__/1.0.0-sandbox-' + Date.now());

    // Copy the full original 1.0.0 into sandbox dir
    fs.copySync(original, sandbox);

    return sandbox;
}

module.exports = {
    createSandboxedTemplate,
};
