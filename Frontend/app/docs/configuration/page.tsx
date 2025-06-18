import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Accordion } from "@/components/accordion"
import { Alert, AlertDescription } from "@/components/alert"
import { Settings, FileText } from "lucide-react"

export default function ConfigurationPage() {
  const configSections = [
    {
      id: "global",
      title: "Global Configuration",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">Configure global settings for Freakend CLI that apply to all projects.</p>
          <CodeBlock
            language="bash"
            code={`# Set default framework
frx config set default-framework nodejs

# Set default database
frx config set default-database mongodb

# Set default template directory
frx config set template-dir ~/.freakend/templates

# View all configuration
frx config list`}
          />
        </div>
      ),
    },
    {
      id: "project",
      title: "Project Configuration",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">Project-specific configuration using freakend.config.js file.</p>
          <CodeBlock
            language="javascript"
            code={`// freakend.config.js
module.exports = {
  // Default framework for this project
  framework: 'nodejs',
  
  // Database configuration
  database: {
    type: 'mongodb',
    url: process.env.DATABASE_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // Authentication settings
  auth: {
    provider: 'jwt',
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
    refreshToken: true
  },
  
  // File upload settings
  upload: {
    provider: 'aws-s3',
    bucket: process.env.AWS_S3_BUCKET,
    maxSize: '10MB',
    allowedTypes: ['image/*', 'application/pdf']
  },
  
  // Email settings
  email: {
    provider: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.FROM_EMAIL,
    templates: './templates/email'
  },
  
  // Payment settings
  payment: {
    provider: 'stripe',
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: 'usd'
  },
  
  // Code generation options
  generation: {
    typescript: true,
    tests: true,
    documentation: true,
    docker: false
  },
  
  // Custom templates
  templates: {
    directory: './custom-templates',
    override: ['auth', 'crud']
  }
};`}
          />
        </div>
      ),
    },
    {
      id: "environment",
      title: "Environment Variables",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">Required and optional environment variables for different modules.</p>
          <CodeBlock
            language="bash"
            code={`# Database
DATABASE_URL=mongodb://localhost:27017/myapp
POSTGRES_URL=postgresql://user:pass@localhost:5432/myapp

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# AWS Services
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Email Services
SENDGRID_API_KEY=SG.your-api-key
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-domain.com

# Payment
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Redis (for queues)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Application
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000`}
          />
        </div>
      ),
    },
    {
      id: "templates",
      title: "Custom Templates",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">Create and use custom templates for code generation.</p>
          <CodeBlock
            language="bash"
            code={`# Create custom template directory
mkdir -p ~/.freakend/templates/custom-auth

# Template structure
~/.freakend/templates/custom-auth/
├── controller.hbs
├── model.hbs
├── routes.hbs
├── middleware.hbs
└── template.json`}
          />

          <div className="mt-4">
            <h4 className="text-white font-semibold mb-2">Template Configuration (template.json):</h4>
            <CodeBlock
              language="json"
              code={`{
  "name": "custom-auth",
  "description": "Custom authentication template",
  "version": "1.0.0",
  "framework": "nodejs",
  "dependencies": [
    "express",
    "jsonwebtoken",
    "bcryptjs",
    "mongoose"
  ],
  "files": [
    {
      "template": "controller.hbs",
      "output": "src/controllers/authController.js"
    },
    {
      "template": "model.hbs", 
      "output": "src/models/User.js"
    },
    {
      "template": "routes.hbs",
      "output": "src/routes/authRoutes.js"
    },
    {
      "template": "middleware.hbs",
      "output": "src/middleware/authMiddleware.js"
    }
  ],
  "variables": {
    "jwtSecret": "JWT_SECRET",
    "bcryptRounds": 12,
    "tokenExpiry": "7d"
  }
}`}
            />
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30 mb-4">
          Configuration
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Configuration & Customization</h1>
        <p className="text-xl text-slate-300">
          Learn how to configure Freakend CLI for your specific needs and create custom templates.
        </p>
      </div>

      <Alert className="mb-8 border-blue-700/30 bg-blue-950/30">
        <Settings className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <strong>Pro Tip:</strong> Use project-specific configuration files to maintain consistent settings across your
          team.
        </AlertDescription>
      </Alert>

      {/* Configuration Sections */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Configuration Options</h2>
        <Accordion items={configSections} defaultOpen={["global"]} allowMultiple />
      </div>

      {/* Framework-Specific Configuration */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Framework-Specific Settings</h2>

        <Tabs defaultValue="nodejs" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="nodejs">Node.js</TabsTrigger>
            <TabsTrigger value="django">Django</TabsTrigger>
            <TabsTrigger value="go">Go</TabsTrigger>
            <TabsTrigger value="php">PHP</TabsTrigger>
          </TabsList>

          <TabsContent value="nodejs" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Node.js Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`// freakend.config.js - Node.js specific
module.exports = {
  framework: 'nodejs',
  
  // Package manager preference
  packageManager: 'npm', // npm, yarn, pnpm
  
  // Node.js version
  nodeVersion: '18.x',
  
  // Express configuration
  express: {
    port: 3000,
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  
  // Database ORM preference
  orm: 'mongoose', // mongoose, prisma, sequelize
  
  // Testing framework
  testing: {
    framework: 'jest',
    coverage: true,
    e2e: 'supertest'
  },
  
  // Linting and formatting
  linting: {
    eslint: true,
    prettier: true,
    husky: true
  }
};`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="django" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Django Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="python"
                  code={`# freakend.config.py - Django specific
FREAKEND_CONFIG = {
    'framework': 'django',
    
    # Django version
    'django_version': '4.2',
    
    # Python version
    'python_version': '3.11',
    
    # Database configuration
    'database': {
        'engine': 'postgresql',  # postgresql, mysql, sqlite
        'name': 'myapp',
        'user': 'postgres',
        'password': 'password',
        'host': 'localhost',
        'port': '5432',
    },
    
    # Django REST Framework
    'drf': {
        'enabled': True,
        'pagination': 'PageNumberPagination',
        'authentication': ['TokenAuthentication', 'SessionAuthentication'],
        'permissions': ['IsAuthenticated'],
    },
    
    # Celery configuration
    'celery': {
        'broker': 'redis://localhost:6379/0',
        'result_backend': 'redis://localhost:6379/0',
        'timezone': 'UTC',
    },
    
    # Testing
    'testing': {
        'framework': 'pytest',
        'coverage': True,
        'factory_boy': True,
    },
    
    # Static files
    'static_files': {
        'storage': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        'url': '/static/',
        'root': 'staticfiles/',
    }
}`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="go" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Go Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="go"
                  code={`// freakend.config.go - Go specific
package config

type FreakendConfig struct {
    Framework string \`json:"framework"\`
    
    // Go version
    GoVersion string \`json:"go_version"\`
    
    // Web framework
    WebFramework string \`json:"web_framework"\` // fiber, gin, echo
    
    // Database
    Database struct {
        Driver string \`json:"driver"\` // postgres, mysql, sqlite
        DSN    string \`json:"dsn"\`
        ORM    string \`json:"orm"\`    // gorm, sqlx, ent
    } \`json:"database"\`
    
    // Server configuration
    Server struct {
        Port         int    \`json:"port"\`
        ReadTimeout  int    \`json:"read_timeout"\`
        WriteTimeout int    \`json:"write_timeout"\`
        IdleTimeout  int    \`json:"idle_timeout"\`
    } \`json:"server"\`
    
    // Authentication
    Auth struct {
        Provider   string \`json:"provider"\`   // jwt, oauth2
        Secret     string \`json:"secret"\`
        Expiration int    \`json:"expiration"\`
    } \`json:"auth"\`
    
    // Logging
    Logging struct {
        Level  string \`json:"level"\`  // debug, info, warn, error
        Format string \`json:"format"\` // json, text
        Output string \`json:"output"\` // stdout, file
    } \`json:"logging"\`
    
    // Testing
    Testing struct {
        Framework string \`json:"framework"\` // testify, ginkgo
        Coverage  bool   \`json:"coverage"\`
    } \`json:"testing"\`
}`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="php" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">PHP Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="php"
                  code={`<?php
// freakend.config.php - PHP specific
return [
    'framework' => 'laravel',
    
    // PHP version
    'php_version' => '8.2',
    
    // Laravel version
    'laravel_version' => '10.x',
    
    // Database configuration
    'database' => [
        'default' => 'mysql',
        'connections' => [
            'mysql' => [
                'driver' => 'mysql',
                'host' => env('DB_HOST', '127.0.0.1'),
                'port' => env('DB_PORT', '3306'),
                'database' => env('DB_DATABASE', 'forge'),
                'username' => env('DB_USERNAME', 'forge'),
                'password' => env('DB_PASSWORD', ''),
            ],
        ],
    ],
    
    // Authentication
    'auth' => [
        'provider' => 'sanctum', // sanctum, passport, jwt
        'guards' => [
            'api' => [
                'driver' => 'sanctum',
                'provider' => 'users',
            ],
        ],
    ],
    
    // Queue configuration
    'queue' => [
        'default' => 'redis',
        'connections' => [
            'redis' => [
                'driver' => 'redis',
                'connection' => 'default',
                'queue' => env('REDIS_QUEUE', 'default'),
            ],
        ],
    ],
    
    // File storage
    'filesystems' => [
        'default' => 's3',
        'disks' => [
            's3' => [
                'driver' => 's3',
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
                'region' => env('AWS_DEFAULT_REGION'),
                'bucket' => env('AWS_BUCKET'),
            ],
        ],
    ],
    
    // Testing
    'testing' => [
        'framework' => 'phpunit',
        'feature_tests' => true,
        'unit_tests' => true,
        'coverage' => true,
    ],
];`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* CLI Commands */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Configuration Commands</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Global Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="bash"
                code={`# View current configuration
frx config list

# Set default framework
frx config set framework nodejs

# Set default database
frx config set database mongodb

# Set template directory
frx config set templates ~/.freakend/templates

# Reset to defaults
frx config reset`}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Project Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="bash"
                code={`# Initialize project config
frx init

# Validate configuration
frx config validate

# Generate config template
frx config template --framework nodejs

# Import configuration
frx config import ./freakend.config.js`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
