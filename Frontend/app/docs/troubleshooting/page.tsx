import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/alert"
import { AlertTriangle, Bug, HelpCircle, Wrench } from "lucide-react"

export default function TroubleshootingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-red-600/20 text-red-400 border-red-600/30 mb-4">
          Troubleshooting
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Common Issues & Solutions</h1>
        <p className="text-xl text-slate-300">Quick fixes for the most common problems when using Freakend CLI.</p>
      </div>

      <Tabs defaultValue="installation" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="runtime">Runtime</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="installation" className="mt-8">
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bug className="w-5 h-5 text-red-400" />
                  Command not found: frx
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="error">
                  <AlertDescription>
                    <strong>Error:</strong> 'frx' is not recognized as an internal or external command
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="text-white font-semibold mb-2">Solution:</h4>
                  <p className="text-slate-300 mb-4">
                    This usually means Freakend CLI is not installed globally or not in your PATH.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">1. Install globally:</p>
                      <CodeBlock language="bash" code="npm install -g freakend-cli" />
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">2. Verify installation:</p>
                      <CodeBlock language="bash" code="frx --version" />
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">3. If still not working, check your PATH:</p>
                      <CodeBlock language="bash" code="npm config get prefix" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Permission denied errors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="warning">
                  <AlertDescription>
                    <strong>Error:</strong> EACCES: permission denied, access '/usr/local/lib/node_modules'
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="text-white font-semibold mb-2">Solutions:</h4>

                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-300 mb-2">Option 1: Use npx (recommended):</p>
                      <CodeBlock language="bash" code="npx freakend-cli add login -en" />
                    </div>

                    <div>
                      <p className="text-slate-300 mb-2">Option 2: Fix npm permissions:</p>
                      <CodeBlock
                        language="bash"
                        code={`mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc`}
                      />
                    </div>

                    <div>
                      <p className="text-slate-300 mb-2">Option 3: Use sudo (not recommended):</p>
                      <CodeBlock language="bash" code="sudo npm install -g freakend-cli" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generation" className="mt-8">
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bug className="w-5 h-5 text-red-400" />
                  Files not generating
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="error">
                  <AlertDescription>
                    <strong>Error:</strong> Command runs but no files are created
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="text-white font-semibold mb-2">Troubleshooting steps:</h4>

                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">1. Check if you're in the right directory:</p>
                      <CodeBlock language="bash" code="pwd" />
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">2. Verify write permissions:</p>
                      <CodeBlock language="bash" code="ls -la" />
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">3. Run with verbose output:</p>
                      <CodeBlock language="bash" code="frx add login -en --verbose" />
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">4. Force overwrite existing files:</p>
                      <CodeBlock language="bash" code="frx add login -en --force" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Unsupported framework
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="warning">
                  <AlertDescription>
                    <strong>Error:</strong> Framework '-xyz' is not supported
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="text-white font-semibold mb-2">Available frameworks:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-300">
                      <code className="text-green-400">-en</code> - Node.js + Express
                    </div>
                    <div className="text-slate-300">
                      <code className="text-green-400">-pyd</code> - Python + Django
                    </div>
                    <div className="text-slate-300">
                      <code className="text-green-400">-go</code> - Go + Fiber
                    </div>
                    <div className="text-slate-300">
                      <code className="text-green-400">-php</code> - PHP + Laravel
                    </div>
                    <div className="text-slate-300">
                      <code className="text-green-400">-fa</code> - Python + FastAPI
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="runtime" className="mt-8">
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bug className="w-5 h-5 text-red-400" />
                  Module not found errors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="error">
                  <AlertDescription>
                    <strong>Error:</strong> Cannot find module 'express' or similar dependency errors
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="text-white font-semibold mb-2">Solution:</h4>
                  <p className="text-slate-300 mb-4">Install the required dependencies after generating code:</p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">For Node.js projects:</p>
                      <CodeBlock
                        language="bash"
                        code={`npm install express mongoose bcryptjs jsonwebtoken
npm install --save-dev nodemon`}
                      />
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">For Python projects:</p>
                      <CodeBlock language="bash" code="pip install -r requirements.txt" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Environment variables not loaded
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="warning">
                  <AlertDescription>
                    <strong>Error:</strong> JWT_SECRET is not defined or database connection fails
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="text-white font-semibold mb-2">Solution:</h4>
                  <p className="text-slate-300 mb-4">Create a .env file in your project root:</p>

                  <CodeBlock
                    language="bash"
                    code={`# .env file
JWT_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=mongodb://localhost:27017/your-database
PORT=3000

# For payment integration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...`}
                  />

                  <p className="text-slate-400 text-sm mt-4">
                    Make sure to install dotenv: <code className="text-green-400">npm install dotenv</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="mt-8">
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-400" />
                  Production deployment issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Common deployment checklist:</h4>

                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-300 mb-2">1. Environment variables:</p>
                      <CodeBlock
                        language="bash"
                        code={`# Make sure all required env vars are set
NODE_ENV=production
JWT_SECRET=your-production-secret
DATABASE_URL=your-production-db-url`}
                      />
                    </div>

                    <div>
                      <p className="text-slate-300 mb-2">2. Build process:</p>
                      <CodeBlock
                        language="bash"
                        code={`npm run build
npm start`}
                      />
                    </div>

                    <div>
                      <p className="text-slate-300 mb-2">3. Database migrations:</p>
                      <CodeBlock language="bash" code="npm run migrate" />
                    </div>

                    <div>
                      <p className="text-slate-300 mb-2">4. Health check endpoint:</p>
                      <CodeBlock
                        language="javascript"
                        code={`// Add to your app.js
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Get Help Section */}
      <div className="mt-12">
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              Still need help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">If you're still experiencing issues, here are additional resources:</p>
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="https://github.com/freakend/cli/issues"
                className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <h4 className="text-white font-semibold mb-1">GitHub Issues</h4>
                <p className="text-slate-400 text-sm">Report bugs and request features</p>
              </a>
              <a
                href="https://discord.gg/freakend"
                className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <h4 className="text-white font-semibold mb-1">Discord Community</h4>
                <p className="text-slate-400 text-sm">Get help from the community</p>
              </a>
              <a
                href="https://github.com/freakend/cli/discussions"
                className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <h4 className="text-white font-semibold mb-1">Discussions</h4>
                <p className="text-slate-400 text-sm">Ask questions and share ideas</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
