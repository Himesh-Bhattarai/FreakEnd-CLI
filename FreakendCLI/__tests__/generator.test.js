const fs = require('fs-extra');
const path = require('path');
const { createSandboxedTemplate } = require('./testUtils');

test('Login folder should exist in sandbox', () => {
    const sandboxPath = createSandboxedTemplate();
    const featurePath = path.join(sandboxPath, 'env');
    expect(fs.existsSync(featurePath)).toBe(true);
});
