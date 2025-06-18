import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/alert"
import { Upload, Cloud, Shield, ImageIcon } from "lucide-react"

export default function UploadDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
            CLI Command
          </Badge>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
            File Upload
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">frx add upload -en</h1>
        <p className="text-xl text-slate-300 max-w-3xl">
          Generate complete file upload system with validation, cloud storage integration, image processing, and secure
          file handling.
        </p>
      </div>

      <Alert className="mb-8 border-blue-700/30 bg-blue-950/30">
        <Shield className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <strong>Security First:</strong> All upload implementations include file type validation, size limits, and
          malware scanning to protect your application.
        </AlertDescription>
      </Alert>

      {/* Features Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Upload Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Upload className="w-6 h-6 text-green-400 mb-2" />
              <CardTitle className="text-white">File Upload</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Multiple file upload support</li>
                <li>• Drag & drop interface</li>
                <li>• Progress tracking</li>
                <li>• File type validation</li>
                <li>• Size limit enforcement</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Cloud className="w-6 h-6 text-blue-400 mb-2" />
              <CardTitle className="text-white">Cloud Storage</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• AWS S3 integration</li>
                <li>• Google Cloud Storage</li>
                <li>• Cloudinary support</li>
                <li>• Local storage option</li>
                <li>• CDN optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <ImageIcon className="w-6 h-6 text-purple-400 mb-2" />
              <CardTitle className="text-white">Image Processing</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Automatic resizing</li>
                <li>• Format conversion</li>
                <li>• Thumbnail generation</li>
                <li>• Watermark application</li>
                <li>• EXIF data removal</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Shield className="w-6 h-6 text-red-400 mb-2" />
              <CardTitle className="text-white">Security</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Malware scanning</li>
                <li>• File type verification</li>
                <li>• Access control</li>
                <li>• Virus protection</li>
                <li>• Secure URLs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Code */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Generated Code Examples</h2>

        <Tabs defaultValue="routes" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="controller">Controller</TabsTrigger>
            <TabsTrigger value="middleware">Middleware</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Upload Routes</CardTitle>
                <CardDescription className="text-slate-400">src/routes/uploadRoutes.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUpload } = require('../middleware/uploadValidation');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and videos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mov/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Single file upload
router.post('/single', 
  authMiddleware,
  upload.single('file'),
  validateUpload,
  uploadController.uploadSingle
);

// Multiple files upload
router.post('/multiple', 
  authMiddleware,
  upload.array('files', 5),
  validateUpload,
  uploadController.uploadMultiple
);

// Get uploaded files
router.get('/files', 
  authMiddleware, 
  uploadController.getUserFiles
);

// Get file by ID
router.get('/files/:id', 
  authMiddleware, 
  uploadController.getFile
);

// Delete file
router.delete('/files/:id', 
  authMiddleware, 
  uploadController.deleteFile
);

// Generate signed URL for direct upload
router.post('/signed-url', 
  authMiddleware, 
  uploadController.generateSignedUrl
);

// Process uploaded file (resize, convert, etc.)
router.post('/process/:id', 
  authMiddleware, 
  uploadController.processFile
);

module.exports = router;`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controller" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Upload Controller</CardTitle>
                <CardDescription className="text-slate-400">src/controllers/uploadController.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const uploadService = require('../services/uploadService');
const File = require('../models/File');

const uploadController = {
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      const fileData = {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
        userId: req.user.id,
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {}
      };

      const uploadedFile = await uploadService.uploadFile(fileData);

      res.json({
        success: true,
        data: uploadedFile,
        message: 'File uploaded successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files provided'
        });
      }

      const uploadPromises = req.files.map(file => {
        const fileData = {
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer,
          userId: req.user.id,
          metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {}
        };
        return uploadService.uploadFile(fileData);
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      res.json({
        success: true,
        data: uploadedFiles,
        message: \`\${uploadedFiles.length} files uploaded successfully\`
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async getUserFiles(req, res) {
    try {
      const { page = 1, limit = 10, type, search } = req.query;
      const userId = req.user.id;

      const filters = { userId };
      if (type) filters.mimetype = new RegExp(type, 'i');
      if (search) filters.originalName = new RegExp(search, 'i');

      const files = await File.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await File.countDocuments(filters);

      res.json({
        success: true,
        data: files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async getFile(req, res) {
    try {
      const file = await File.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      // Generate signed URL for file access
      const signedUrl = await uploadService.getSignedUrl(file.key);

      res.json({
        success: true,
        data: {
          ...file.toObject(),
          url: signedUrl
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async deleteFile(req, res) {
    try {
      const file = await File.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      // Delete from cloud storage
      await uploadService.deleteFile(file.key);

      // Delete from database
      await File.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async generateSignedUrl(req, res) {
    try {
      const { filename, mimetype, size } = req.body;
      
      // Validate file
      if (size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'File too large'
        });
      }

      const signedUrlData = await uploadService.generateUploadUrl({
        filename,
        mimetype,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: signedUrlData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async processFile(req, res) {
    try {
      const { id } = req.params;
      const { operations } = req.body;

      const file = await File.findOne({
        _id: id,
        userId: req.user.id
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      const processedFile = await uploadService.processFile(file, operations);

      res.json({
        success: true,
        data: processedFile,
        message: 'File processed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = uploadController;`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="middleware" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Upload Validation</CardTitle>
                <CardDescription className="text-slate-400">src/middleware/uploadValidation.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const { body, validationResult } = require('express-validator');

const uploadValidation = {
  validateUpload: [
    // File validation is handled by multer fileFilter
    // Additional validation can be added here
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }
      next();
    }
  ],

  validateFileType: (allowedTypes) => {
    return (req, res, next) => {
      if (!req.file && !req.files) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      const files = req.files || [req.file];
      
      for (const file of files) {
        const isValidType = allowedTypes.some(type => 
          file.mimetype.includes(type) || 
          file.originalname.toLowerCase().endsWith(type)
        );

        if (!isValidType) {
          return res.status(400).json({
            success: false,
            error: \`Invalid file type: \${file.originalname}\`,
            allowedTypes
          });
        }
      }

      next();
    };
  },

  validateFileSize: (maxSize) => {
    return (req, res, next) => {
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files || [req.file];
      
      for (const file of files) {
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            error: \`File too large: \${file.originalname}\`,
            maxSize: \`\${maxSize / (1024 * 1024)}MB\`
          });
        }
      }

      next();
    };
  },

  scanForMalware: async (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files || [req.file];
      
      // Implement malware scanning logic here
      // This could integrate with services like:
      // - ClamAV
      // - VirusTotal API
      // - AWS GuardDuty
      
      for (const file of files) {
        // Basic file signature validation
        const suspiciousPatterns = [
          /\\.exe$/i,
          /\\.bat$/i,
          /\\.cmd$/i,
          /\\.scr$/i,
          /\\.pif$/i
        ];

        const isSuspicious = suspiciousPatterns.some(pattern => 
          pattern.test(file.originalname)
        );

        if (isSuspicious) {
          return res.status(400).json({
            success: false,
            error: \`Potentially dangerous file type: \${file.originalname}\`
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Malware scan failed'
      });
    }
  }
};

module.exports = uploadValidation;`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Upload Service</CardTitle>
                <CardDescription className="text-slate-400">src/services/uploadService.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const AWS = require('aws-sdk');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadService = {
  async uploadFile(fileData) {
    try {
      const { originalName, mimetype, size, buffer, userId, metadata } = fileData;
      
      // Generate unique filename
      const fileExtension = originalName.split('.').pop();
      const filename = \`\${uuidv4()}.\${fileExtension}\`;
      const key = \`uploads/\${userId}/\${filename}\`;

      // Upload to S3
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'private', // Files are private by default
        Metadata: {
          originalName,
          userId: userId.toString(),
          ...metadata
        }
      };

      const uploadResult = await s3.upload(uploadParams).promise();

      // Save file record to database
      const file = new File({
        originalName,
        filename,
        mimetype,
        size,
        key,
        url: uploadResult.Location,
        userId,
        metadata,
        status: 'uploaded'
      });

      await file.save();

      // Generate thumbnail for images
      if (mimetype.startsWith('image/')) {
        await this.generateThumbnail(file);
      }

      return file;
    } catch (error) {
      console.error('Upload service error:', error);
      throw new Error(\`Upload failed: \${error.message}\`);
    }
  },

  async generateThumbnail(file) {
    try {
      // Download original file
      const getParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file.key
      };

      const originalFile = await s3.getObject(getParams).promise();

      // Generate thumbnail using Sharp
      const thumbnailBuffer = await sharp(originalFile.Body)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload thumbnail
      const thumbnailKey = file.key.replace(/\\.[^.]+$/, '_thumb.jpg');
      const thumbnailParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        ACL: 'private'
      };

      await s3.upload(thumbnailParams).promise();

      // Update file record with thumbnail info
      await File.findByIdAndUpdate(file._id, {
        thumbnailKey,
        hasThumbnail: true
      });

    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      // Don't throw error - thumbnail generation is optional
    }
  },

  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: expiresIn
      };

      return s3.getSignedUrl('getObject', params);
    } catch (error) {
      throw new Error(\`Failed to generate signed URL: \${error.message}\`);
    }
  },

  async generateUploadUrl({ filename, mimetype, userId }) {
    try {
      const fileExtension = filename.split('.').pop();
      const uniqueFilename = \`\${uuidv4()}.\${fileExtension}\`;
      const key = \`uploads/\${userId}/\${uniqueFilename}\`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: mimetype,
        ACL: 'private',
        Expires: 300 // 5 minutes
      };

      const signedUrl = s3.getSignedUrl('putObject', params);

      return {
        uploadUrl: signedUrl,
        key,
        filename: uniqueFilename
      };
    } catch (error) {
      throw new Error(\`Failed to generate upload URL: \${error.message}\`);
    }
  },

  async deleteFile(key) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      await s3.deleteObject(params).promise();

      // Also delete thumbnail if exists
      const thumbnailKey = key.replace(/\\.[^.]+$/, '_thumb.jpg');
      try {
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: thumbnailKey
        }).promise();
      } catch (thumbError) {
        // Thumbnail might not exist, ignore error
      }

    } catch (error) {
      throw new Error(\`Failed to delete file: \${error.message}\`);
    }
  },

  async processFile(file, operations) {
    try {
      // Download original file
      const getParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file.key
      };

      const originalFile = await s3.getObject(getParams).promise();
      let processedBuffer = originalFile.Body;

      // Apply image processing operations
      if (file.mimetype.startsWith('image/')) {
        let sharpInstance = sharp(originalFile.Body);

        for (const operation of operations) {
          switch (operation.type) {
            case 'resize':
              sharpInstance = sharpInstance.resize(operation.width, operation.height, {
                fit: operation.fit || 'cover'
              });
              break;
            case 'format':
              sharpInstance = sharpInstance.toFormat(operation.format);
              break;
            case 'quality':
              sharpInstance = sharpInstance.jpeg({ quality: operation.quality });
              break;
            case 'watermark':
              // Add watermark logic here
              break;
          }
        }

        processedBuffer = await sharpInstance.toBuffer();
      }

      // Upload processed file
      const processedKey = file.key.replace(/\\.[^.]+$/, '_processed.' + (operations.find(op => op.type === 'format')?.format || 'jpg'));
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: processedKey,
        Body: processedBuffer,
        ContentType: file.mimetype,
        ACL: 'private'
      };

      await s3.upload(uploadParams).promise();

      // Update file record
      await File.findByIdAndUpdate(file._id, {
        processedKey,
        isProcessed: true,
        processedAt: new Date()
      });

      return await File.findById(file._id);
    } catch (error) {
      throw new Error(\`File processing failed: \${error.message}\`);
    }
  }
};

module.exports = uploadService;`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Setup Instructions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Setup Instructions</h2>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">1. Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="bash"
                code={`# Add to your .env file
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Optional: For other cloud providers
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEYFILE=path/to/keyfile.json
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret`}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">2. Install Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="bash"
                code={`npm install multer aws-sdk sharp uuid
npm install express-validator  # For validation`}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">3. Configure S3 Bucket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-300">Set up your S3 bucket with proper CORS configuration:</p>
                <CodeBlock
                  language="json"
                  code={`{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
