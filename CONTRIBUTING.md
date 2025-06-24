## Intorduction
Welcome to the Freakend CLI project! This is a powerful backend scaffolding tool that lets you generate production-ready server features using commands like:

npx freakend init
npx freakend add login -em 

                    where, -em refer node-express, -pyf refer python + FastAPI, -pyd refer Python + Django.

Our CLI supports multiple frameworks and languages (Node.js, Python, etc.), and follows a modular, versioned folder structure. This guide will help you contribute correctly and consistently.

# Project Structure

## FreakendCLI/
    ├── bin/                 ## CLI entry point
    ├── core/                ## Core logic: file generation, prompts, templates
    ├── templates/           ## CLI feature templates by language/framework/    version
    │   ├── node-express/
    │   │   └── 1.0.0/
    │   │       └── login/   # Feature name
    │   │           ├── controllers/
    │   │           ├── routes/
    │   │           ├── models/
    │   │           ├── services/
    │   │           ├── middleware/
    │   │           └── generator.config.json
    │   ├── python-flask/
    │   └── 1.0.0/
    │       └── login/
    │           ├── controllers/
    │           ├── routes/
    │           ├── models/
    │           ├── services/
    │           └── generator.config.json
    ├── __tests__/           # Feature tests (Jest, etc.)
    ├── .github/workflows/   # GitHub Actions CI
    ├── README.md
    └── CONTRIBUTING.md

## 🧠How the CLI Works

You run a command like:

 -npx freakend add login -em

The CLI looks in:

templates/<framework>/<version>/<feature>

And copies the files into the appropriate backend project folders.

Some files are dynamically modified (e.g. route injection, config update).

All features are modular and testable independently.

## 📦 Adding a New Feature

🪜 Steps

1. Fork the repo and create a new branch
2. Navigate to the templates/ folder
3. Create a new feature folder inside the correct framework/version path:

Example:
templates/node-express/1.0.0/user-profile/
Follow this folder structure inside your feature:

├── controllers/
├── models/
├── routes/
├── services/
├── middleware/
└── generator.config.json

Write test cases inside __tests__/
Run npm test to make sure everything passes
Push and create a Pull Request

## ✅ Contribution Guidelines

Keep folder and file names kebab-case
Follow the existing folder structure and design pattern
Add at least one integration test for new features
Keep logic modular (no giant files)
Use generator.config.json to declare how your feature is injected
Do not commit .env, node_modules, or __tests-temp__/

## ⚙️ Run Tests Locally
npm install
npm test



# Contributing to Freakend CLI 🛠️

## Folder Structure
All CLI features go under: `templates/<framework>/<version>/<feature-name>`

Example: `templates/node-express/1.0.0/auth/`

## Adding a Feature
1. Fork the repo
2. Add your new CLI feature inside `templates/`
3. Write corresponding tests inside `__tests__/`
4. Run `npm test` and make sure tests pass
5. Submit a Pull Request (PR)

## Coding Guidelines
- Use consistent folder structure
- Keep controllers, services, routes modular
- Add at least 1 feature test

## Need to know
- Every feature must be secure, reusable, fit on every scale and Most importnt Production level code required.

