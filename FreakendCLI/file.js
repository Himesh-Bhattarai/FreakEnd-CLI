const fs = require("fs-extra");
const path = require("path");

const categories = {
    "auth": ["auth", "signin", "password-reset", "email-verify", "otp", "oauth", "roles", "permissions", "login", "register", "logout", "forgot-password"],
    "user": ["profiles", "update-user", "user-block", "avatar"],
    "crud": ["crud", "soft-delete", "pagination", "search", "relation"],
    "comments": ["comments", "reactions", "report"],
    "media": ["upload", "image-resize", "video-upload", "s3-upload"],
    "security": ["rate-limit", "api-key", "cors", "security-headers"],
    "admin": ["admin", "analytics", "audit-log"],
    "api": ["api", "graphql", "swagger", "versioning"],
    "smart": ["chatbot", "ai-search"],
    "devops": ["docker", "env", "seeder", "cron", "logger"],
    "business": ["payment", "subscription", "invoice"],
    "notifications": ["email-service", "sms", "notifications", "push"]
};

const basePath = path.join(__dirname, "templates/node-express/1.0.0");
const subdirs = ["controllers", "routes", "models", "utils", "middleware"];

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

for (const [cat, features] of Object.entries(categories)) {
    for (const feature of features) {
        for (const sub of subdirs) {
            const fullPath = path.join(basePath, feature, sub);
            fs.ensureDirSync(fullPath);

            // Filename convention: feature + CapitalizedSubdir + '.js'
            // e.g. loginController.js, signupMiddleware.js
            const fileName = `${feature.replace(/-/g, '')}${capitalizeFirstLetter(sub)}.js`;
            const filePath = path.join(fullPath, fileName);

            // If file doesn't exist, create with boilerplate content
            if (!fs.existsSync(filePath)) {
                const boilerplate = `// ${fileName} - Auto generated\n\nmodule.exports = function() {\n    // TODO: Implement ${fileName} functionality\n};\n`;
                fs.writeFileSync(filePath, boilerplate, "utf8");
                console.log(`Created: ${filePath}`);
            }
        }
    }
}

console.log("✅ All folders and files created with boilerplate.");
