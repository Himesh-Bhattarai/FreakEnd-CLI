import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/alert"
import { Heart, GitFork, Users, Code } from "lucide-react"

export default function ContributingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 border-purple-600/30 mb-4">
          Contributing
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Contributing to Freakend</h1>
        <p className="text-xl text-slate-300">
          Help us make Freakend better! Learn how to contribute code, templates, documentation, and more.
        </p>
      </div>

      <Alert variant="success" className="mb-8">
        <Heart className="h-4 w-4" />
        <AlertDescription>
          <strong>Thank you!</strong> Every contribution, no matter how small, helps make Freakend better for everyone.
        </AlertDescription>
      </Alert>

      {/* Ways to Contribute */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Ways to Contribute</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Code className="w-6 h-6 text-blue-400 mb-2" />
              <CardTitle className="text-white">Code Contributions</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Add new framework support</li>
                <li>• Create new module templates</li>
                <li>• Fix bugs and improve performance</li>
                <li>• Enhance CLI functionality</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Users className="w-6 h-6 text-green-400 mb-2" />
              <CardTitle className="text-white">Community</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Improve documentation</li>
                <li>• Help others in discussions</li>
                <li>• Report bugs and issues</li>
                <li>• Share examples and tutorials</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Getting Started</h2>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GitFork className="w-5 h-5 text-blue-400" />
                1. Fork and Clone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-300 mb-3">Fork the repository and clone it locally:</p>
                <CodeBlock
                  language="bash"
                  code={`# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/freakend-cli.git
cd freakend-cli

# Add upstream remote
git remote add upstream https://github.com/freakend/cli.git`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">2. Set Up Development Environment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-300 mb-3">Install dependencies and set up the development environment:</p>
                <CodeBlock
                  language="bash"
                  code={`# Install dependencies
npm install

# Link the CLI for local development
npm link

# Run tests to make sure everything works
npm test`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">3. Create a Branch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-300 mb-3">Create a new branch for your feature or fix:</p>
                <CodeBlock
                  language="bash"
                  code={`# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Development Guidelines */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Development Guidelines</h2>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Code Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-300 mb-3">We use ESLint and Prettier for consistent code formatting:</p>
                <CodeBlock
                  language="bash"
                  code={`# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix`}
                />
              </div>

              <div className="text-slate-300">
                <h4 className="text-white font-semibold mb-2">Linting and Formatting</h4>
                <p className="mb-3">
                  We use ESLint and Prettier to maintain a consistent code style. Before submitting your code, make sure to run the following commands:
                </p>
              </div>
            </CardContent>
          </Card>
        </div>\
      </div>
