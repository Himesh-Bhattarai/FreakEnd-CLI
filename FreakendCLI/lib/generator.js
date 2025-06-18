const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

function copyAllFiles(templateDir, outputDir) {
    fs.readdirSync(templateDir).forEach(item => {
        const srcPath = path.join(templateDir, item);
        const destPath = path.join(outputDir, item);

        const stats = fs.statSync(srcPath);

        if (stats.isDirectory()) {
            fs.ensureDirSync(destPath);
            copyAllFiles(srcPath, destPath); // 🌀 recursive copy
        } else if (stats.isFile()) {
            fs.copySync(srcPath, destPath);
            console.log(chalk.green(`✅ Copied: ${path.relative(__dirname, destPath)}`));
        } else {
            console.log(chalk.yellow(`⚠️ Unknown item (not file/folder): ${item}. Skipping.`));
        }
    });
}

function generate(feature, framework) {
    const templatePath = path.join(__dirname, `../templates/${framework}/1.0.0/${feature}`);
    const outputPath = process.cwd();

    if (!fs.existsSync(templatePath)) {
        console.log(chalk.red(`❌ Feature '${feature}' not found in '${framework}'`));
        return;
    }

    console.log(chalk.blue(`🚀 Generating feature '${feature}' from '${framework}'...`));
    copyAllFiles(templatePath, outputPath);
    console.log(chalk.green(`✨ Feature '${feature}' added successfully!`));
}

module.exports = generate;
