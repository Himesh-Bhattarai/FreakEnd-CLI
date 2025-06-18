import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/accordion"
import { HelpCircle, Zap, Code } from "lucide-react"

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 border-purple-600/30 mb-4">
          FAQ
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-slate-300">
          Find answers to common questions about Freakend CLI, its features, and how to use it effectively.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm">Basic questions about Freakend CLI and its capabilities</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Code className="w-5 h-5 text-green-400" />
              Technical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm">Technical details about customization and integration</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-400" />
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm">How to use Freakend effectively in your projects</p>
          </CardContent>
        </Card>
      </div>

      {/* General Questions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-400" />
          General Questions
        </h2>
        <Accordion type="single" collapsible defaultValue="what-is-freakend">
          <AccordionItem value="what-is-freakend">
            <AccordionTrigger>What is Freakend CLI?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">
                  Freakend is a universal backend scaffolding CLI tool that generates production-ready code for
                  authentication, CRUD operations, payment processing, file uploads, and email services across multiple
                  programming languages and frameworks.
                </p>
                <p className="text-slate-300">
                  Instead of writing boilerplate code from scratch, Freakend generates secure, tested, and optimized
                  code that follows industry best practices, saving you hours or even days of development time.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="supported-frameworks">
            <AccordionTrigger>Which frameworks and languages are supported?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">Currently supported frameworks:</p>
                <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                  <li>
                    <strong>Node.js:</strong> Express.js
                  </li>
                  <li>
                    <strong>Python:</strong> Django, FastAPI
                  </li>
                  <li>
                    <strong>Go:</strong> Fiber
                  </li>
                  <li>
                    <strong>PHP:</strong> Laravel
                  </li>
                </ul>
                <p className="text-slate-300 mt-3">
                  Coming soon: Flask, Spring Boot (Java), Ruby on Rails, .NET Core, and more!
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="is-it-free">
            <AccordionTrigger>Is Freakend CLI free to use?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">
                  Yes! Freakend CLI is completely free and open-source. You can use it for personal projects, commercial
                  applications, and everything in between without any licensing fees.
                </p>
                <p className="text-slate-300">
                  If you find Freakend helpful, consider{" "}
                  <a href="/donate" className="text-blue-400 hover:text-blue-300">
                    supporting the project
                  </a>
                  through donations or by contributing to the codebase.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Technical Questions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Code className="w-6 h-6 text-green-400" />
          Technical Questions
        </h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="customize-generated-code">
            <AccordionTrigger>Can I customize the generated code?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">Yes! You can customize Freakend in several ways:</p>
                <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                  <li>
                    <strong>Configuration files:</strong> Use freakend.config.js to set project-specific options
                  </li>
                  <li>
                    <strong>Custom templates:</strong> Create your own templates for code generation
                  </li>
                  <li>
                    <strong>Post-generation editing:</strong> Modify the generated code to fit your specific needs
                  </li>
                  <li>
                    <strong>Environment variables:</strong> Configure different settings for development, staging, and
                    production
                  </li>
                </ul>
                <p className="text-slate-300 mt-3">
                  Check out our{" "}
                  <a href="/docs/configuration" className="text-blue-400 hover:text-blue-300">
                    Configuration Guide
                  </a>{" "}
                  for detailed instructions.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="existing-project">
            <AccordionTrigger>Can I use Freakend with an existing project?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">
                  Yes! Freakend is designed to work with both new and existing projects. When you run Freakend commands
                  in an existing project, it will:
                </p>
                <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                  <li>Analyze your current project structure</li>
                  <li>Generate code that integrates with your existing codebase</li>
                  <li>Avoid overwriting existing files (unless you use the --force flag)</li>
                  <li>Follow your project's existing conventions and patterns</li>
                </ul>
                <p className="text-slate-300 mt-3">
                  Always backup your project before running Freakend commands on existing codebases.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="database-support">
            <AccordionTrigger>Which databases are supported?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">Freakend supports all major databases:</p>
                <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                  <li>
                    <strong>NoSQL:</strong> MongoDB, Redis
                  </li>
                  <li>
                    <strong>SQL:</strong> PostgreSQL, MySQL, SQLite
                  </li>
                  <li>
                    <strong>Cloud:</strong> AWS DynamoDB, Google Firestore, Azure Cosmos DB
                  </li>
                </ul>
                <p className="text-slate-300 mt-3">
                  You can specify your preferred database using the --database flag or in your configuration file.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="testing-included">
            <AccordionTrigger>Does Freakend generate tests?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">
                  Yes! When you use the --test flag, Freakend generates comprehensive test suites including:
                </p>
                <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                  <li>Unit tests for individual functions and methods</li>
                  <li>Integration tests for API endpoints</li>
                  <li>Authentication and authorization tests</li>
                  <li>Database operation tests</li>
                  <li>Error handling tests</li>
                </ul>
                <p className="text-slate-300 mt-3">
                  Tests are generated using the most popular testing frameworks for each language (Jest for Node.js,
                  pytest for Python, etc.).
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Usage Questions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Usage Questions
        </h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="getting-started">
            <AccordionTrigger>How do I get started with Freakend?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">Getting started is simple:</p>
                <ol className="list-decimal list-inside text-slate-300 space-y-1 ml-4">
                  <li>
                    Install Freakend CLI:{" "}
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">npm install -g freakend-cli</code>
                  </li>
                  <li>Create or navigate to your project directory</li>
                  <li>
                    Run your first command:{" "}
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">frx add login -en</code>
                  </li>
                  <li>
                    Install dependencies:{" "}
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">npm install</code>
                  </li>
                  <li>
                    Start your server: <code className="bg-slate-800 px-2 py-1 rounded text-green-400">npm start</code>
                  </li>
                </ol>
                <p className="text-slate-300 mt-3">
                  Check out our{" "}
                  <a href="/docs/getting-started" className="text-blue-400 hover:text-blue-300">
                    Getting Started Guide
                  </a>{" "}
                  for detailed instructions.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="command-flags">
            <AccordionTrigger>What do the command flags mean?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">Common flags and their meanings:</p>
                <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                  <li>
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">-en</code>: Express + Node.js
                  </li>
                  <li>
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">-pyd</code>: Python + Django
                  </li>
                  <li>
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">-go</code>: Go + Fiber
                  </li>
                  <li>
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">-php</code>: PHP + Laravel
                  </li>
                  <li>
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">--typescript</code>: Generate
                    TypeScript files
                  </li>
                  <li>
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">--test</code>: Include test files
                  </li>
                  <li>
                    <code className="bg-slate-800 px-2 py-1 rounded text-green-400">--force</code>: Overwrite existing
                    files
                  </li>
                </ul>
                <p className="text-slate-300 mt-3">
                  See the{" "}
                  <a href="/docs/cli-reference" className="text-blue-400 hover:text-blue-300">
                    CLI Reference
                  </a>{" "}
                  for a complete list of flags and options.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="multiple-modules">
            <AccordionTrigger>Can I use multiple modules together?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">
                  Freakend modules are designed to work together seamlessly. For example:
                </p>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                  <code className="text-green-400 text-sm">
                    frx add login -en
                    <br />
                    frx add crud -en
                    <br />
                    frx add payment -en
                    <br />
                    frx add upload -en
                    <br />
                    frx add email -en
                  </code>
                </div>
                <p className="text-slate-300 mt-3">
                  This creates a complete backend with authentication, CRUD operations, payment processing, file
                  uploads, and email services.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="deployment">
            <AccordionTrigger>How do I deploy applications built with Freakend?</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-slate-300">
                  Applications generated by Freakend can be deployed to any platform that supports your chosen
                  framework:
                </p>
                <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                  <li>
                    <strong>Cloud platforms:</strong> Vercel, Netlify, Heroku, AWS, Google Cloud, Azure
                  </li>
                  <li>
                    <strong>VPS/Dedicated servers:</strong> DigitalOcean, Linode, Vultr
                  </li>
                  <li>
                    <strong>Containerization:</strong> Docker, Kubernetes
                  </li>
                  <li>
                    <strong>Serverless:</strong> AWS Lambda, Vercel Functions, Netlify Functions
                  </li>
                </ul>
                <p className="text-slate-300 mt-3">
                  The generated code includes deployment configurations and environment setup guides.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Still have questions? */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/30">
        <CardHeader>
          <CardTitle className="text-white">Still have questions?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">Can't find what you're looking for? We're here to help!</p>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://github.com/freakend/cli/discussions"
              className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h4 className="text-white font-semibold mb-1">GitHub Discussions</h4>
              <p className="text-slate-400 text-sm">Ask questions and get help from the community</p>
            </a>
            <a
              href="https://discord.gg/freakend"
              className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h4 className="text-white font-semibold mb-1">Discord Community</h4>
              <p className="text-slate-400 text-sm">Join our Discord for real-time support</p>
            </a>
            <a
              href="mailto:support@freakend.dev"
              className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h4 className="text-white font-semibold mb-1">Email Support</h4>
              <p className="text-slate-400 text-sm">Send us an email for direct assistance</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
