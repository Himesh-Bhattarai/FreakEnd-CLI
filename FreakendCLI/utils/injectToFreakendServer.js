const fs = require('fs');
const path = require('path');

const feature = process.argv[2]; // e.g., "auth"
if (!feature) {
    console.log("❌ Please provide a feature name (e.g., 'auth')");
    process.exit(1);
}

const routeFile = `./${feature}/${feature}.route`;
const routePath = `/api/${feature}`;
const serverPath = path.join(process.cwd(), 'freakend.server.js');

let content;

if (!fs.existsSync(serverPath)) {
    content = `
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cookieParser());

// CLI Feature Mounts
// -- CLI_INJECT_HERE --

app.listen(5000, () => {
  console.log("🧪 Freakend Test Server running at http://localhost:5000");
});
  `.trim();
} else {
    content = fs.readFileSync(serverPath, 'utf-8');
}

if (!content.includes(routeFile)) {
    const requireLine = `const ${feature}Routes = require('${routeFile}');`;
    const useLine = `app.use('${routePath}', ${feature}Routes);`;

    content = content.replace('// -- CLI_INJECT_HERE --', `
${requireLine}
${useLine}
// -- CLI_INJECT_HERE --`.trim());

    fs.writeFileSync(serverPath, content, 'utf-8');
    console.log(`✅ Injected ${feature} into freakend.server.js`);
} else {
    console.log(`⚠️ ${feature} already injected`);
}
