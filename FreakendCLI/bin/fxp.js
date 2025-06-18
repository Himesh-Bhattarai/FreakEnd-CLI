#!/usr/bin/env node

// Logging for debug
console.log('CLI started');
console.log('Arguments:', process.argv);

const { Command } = require("commander");
const chalk = require("chalk");

// Core CLI logic
const generate = require("../lib/generator");
const generateInitNodeExpress = require("../lib/generator/initGenerator");

// Create CLI instance
const program = new Command();

program
    .name("fxp")
    .description("Freakend CLI - Generate backend code instantly")
    .version("1.0.0");

// Command: init
program
    .command("init")
    .description("Initialize a backend project with boilerplate structure")
    .option("-f, --framework <framework>", "Choose your backend framework")
    .action((options) => {
        const framework = options.framework;

        if (framework === "node-express" || framework === "em") {
            console.log(chalk.green(`Initializing backend project: ${framework}`));
            generateInitNodeExpress(process.cwd());
        } else {
            console.log(chalk.red("Unsupported framework. Only 'node-express' is supported for now."));
        }
    });

// Command: add
program
    .command("add")
    .description("Add backend features like login, auth, comments")
    .argument("<feature>", "Feature like login, auth, comment")
    .option("-f, --framework <framework>", "Framework like node-express, python-django")
    .action((feature, options) => {
        const framework = options.framework;

        if (!framework) {
            console.log(chalk.red("Please specify a framework using -f or --framework"));
            return;
        }

        console.log(chalk.blue(`Adding feature '${feature}' for framework '${framework}'`));
        generate(feature, framework);
    });

// Parse input args
program.parse(process.argv);
