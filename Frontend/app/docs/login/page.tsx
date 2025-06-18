import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Terminal, Shield, Zap, CheckCircle } from "lucide-react"

export default function LoginDocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
              CLI Command
            </Badge>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              Node.js + Express
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">frx add login -en</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Generate a complete authentication system with JWT tokens, password hashing, input validation, and secure
            middleware for Node.js with Express.
          </p>
        </div>

        {/* Quick Overview */}
        <Card className="bg-slate-900 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              Command Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-700">
              <span className="text-green-400">frx add login -en</span>
              <div className="text-slate-400 mt-2 space-y-1">
                <div>• Generates authentication routes (register, login, logout)</div>
                <div>• Creates JWT middleware and validation</div>
                <div>• Adds password hashing with bcrypt</div>
                <div>• Includes input validation and error handling</div>
                <div>• Sets up user model and database integration</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What It Does */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">What It Does</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Shield className="w-6 h-6 text-green-400 mb-2" />
                <CardTitle className="text-white">Security First</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    JWT token authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Bcrypt password hashing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Input validation & sanitization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Rate limiting protection
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Zap className="w-6 h-6 text-blue-400 mb-2" />
                <CardTitle className="text-white">Production Ready</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Error handling middleware
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Environment configuration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Database integration ready
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    TypeScript support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generated Folder Structure */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Generated Folder Structure</h2>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-700">
                <div className="text-slate-400">
                  <div className="text-blue-400">src/</div>
                  <div className="ml-2">
                    ├── <span className="text-yellow-400">auth/</span>
                  </div>
                  <div className="ml-4">
                    │ ├── <span className="text-green-400">controllers/</span>
                  </div>
                  <div className="ml-6">│ │ └── authController.js</div>
                  <div className="ml-4">
                    │ ├── <span className="text-green-400">middleware/</span>
                  </div>
                  <div className="ml-6">│ │ ├── authMiddleware.js</div>
                  <div className="ml-6">│ │ └── validation.js</div>
                  <div className="ml-4">
                    │ ├── <span className="text-green-400">models/</span>
                  </div>
                  <div className="ml-6">│ │ └── User.js</div>
                  <div className="ml-4">
                    │ ├── <span className="text-green-400">routes/</span>
                  </div>
                  <div className="ml-6">│ │ └── authRoutes.js</div>
                  <div className="ml-4">
                    │ └── <span className="text-green-400">utils/</span>
                  </div>
                  <div className="ml-6">│ ├── jwt.js</div>
                  <div className="ml-6">│ └── password.js</div>
                  <div className="ml-2">
                    ├── <span className="text-purple-400">config/</span>
                  </div>
                  <div className="ml-4">│ └── auth.js</div>
                  <div className="ml-2">
                    └── <span className="text-cyan-400">tests/</span>
                  </div>
                  <div className="ml-4"> └── auth.test.js</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Generated Code Examples</h2>

          <Tabs defaultValue="routes" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800">
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="controller">Controller</TabsTrigger>
              <TabsTrigger value="middleware">Middleware</TabsTrigger>
              <TabsTrigger value="model">Model</TabsTrigger>
            </TabsList>

            <TabsContent value="routes" className="mt-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Authentication Routes</CardTitle>
                    <CardDescription className="text-slate-400">src/auth/routes/authRoutes.js</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto border border-slate-700">
                    <pre className="text-sm">
                      <code className="text-slate-300">
                        {`const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;`}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="controller" className="mt-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Auth Controller</CardTitle>
                    <CardDescription className="text-slate-400">src/auth/controllers/authController.js</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto border border-slate-700">
                    <pre className="text-sm">
                      <code className="text-slate-300">
                        {`const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const authController = {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          error: 'User already exists' 
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        name
      });
      
      await user.save();
      
      // Generate token
      const token = generateToken(user._id);
      
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }
      
      // Generate token
      const token = generateToken(user._id);
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;`}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="middleware" className="mt-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Auth Middleware</CardTitle>
                    <CardDescription className="text-slate-400">src/auth/middleware/authMiddleware.js</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto border border-slate-700">
                    <pre className="text-sm">
                      <code className="text-slate-300">
                        {`const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid token.' 
    });
  }
};

module.exports = authMiddleware;`}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="model" className="mt-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">User Model</CardTitle>
                    <CardDescription className="text-slate-400">src/auth/models/User.js</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto border border-slate-700">
                    <pre className="text-sm">
                      <code className="text-slate-300">
                        {`const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);`}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Flags Explanation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Command Flags</h2>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 font-mono">-en</Badge>
                  <div>
                    <h3 className="text-white font-semibold">Express + Node.js</h3>
                    <p className="text-slate-400">
                      Generates authentication system using Express.js framework with Node.js runtime
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Badge className="bg-slate-700 text-slate-300 font-mono">--typescript</Badge>
                  <div>
                    <h3 className="text-white font-semibold">TypeScript Support</h3>
                    <p className="text-slate-400">Generate TypeScript files instead of JavaScript (optional)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Badge className="bg-slate-700 text-slate-300 font-mono">--database</Badge>
                  <div>
                    <h3 className="text-white font-semibold">Database Integration</h3>
                    <p className="text-slate-400">Specify database: mongodb, postgresql, mysql (default: mongodb)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-world Use Case */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Real-world Use Case</h2>
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/30">
            <CardHeader>
              <CardTitle className="text-white">E-commerce API Development</CardTitle>
              <CardDescription className="text-slate-300">
                Building a secure authentication system for an online store
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <div className="space-y-4">
                <p>
                  <strong className="text-white">Scenario:</strong> You're building an e-commerce API and need a robust
                  authentication system that handles user registration, login, and secure access to protected routes
                  like order history and user profiles.
                </p>

                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-white font-semibold mb-2">Instead of spending hours writing:</h4>
                  <ul className="text-slate-400 space-y-1 text-sm">
                    <li>• JWT token generation and validation logic</li>
                    <li>• Password hashing and comparison functions</li>
                    <li>• Input validation and sanitization</li>
                    <li>• Error handling middleware</li>
                    <li>• Database models and relationships</li>
                    <li>• Authentication middleware for protected routes</li>
                  </ul>
                </div>

                <div className="bg-green-950/30 rounded-lg p-4 border border-green-700/30">
                  <h4 className="text-green-400 font-semibold mb-2">With Freakend, you get:</h4>
                  <ul className="text-green-300 space-y-1 text-sm">
                    <li>• Complete authentication system in 3 seconds</li>
                    <li>• Production-ready security implementations</li>
                    <li>• Comprehensive test coverage</li>
                    <li>• Easy integration with your existing codebase</li>
                    <li>• Time to focus on business logic instead of boilerplate</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Next Steps</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Customize Your Auth</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p className="mb-4">Modify the generated code to fit your specific requirements:</p>
                <ul className="space-y-2 text-sm">
                  <li>• Add OAuth providers (Google, GitHub, etc.)</li>
                  <li>• Implement role-based access control</li>
                  <li>• Add email verification</li>
                  <li>• Configure session management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Add More Modules</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p className="mb-4">Extend your backend with additional modules:</p>
                <div className="space-y-2 text-sm font-mono">
                  <div className="text-green-400">frx add crud -en</div>
                  <div className="text-blue-400">frx add payment -en</div>
                  <div className="text-purple-400">frx add upload -en</div>
                  <div className="text-yellow-400">frx add email -en</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
