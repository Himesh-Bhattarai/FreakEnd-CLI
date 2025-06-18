import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Database, Filter, Search } from "lucide-react"

export default function CrudDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
            CLI Command
          </Badge>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
            CRUD Operations
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">frx add crud -en</h1>
        <p className="text-xl text-slate-300 max-w-3xl">
          Generate complete CRUD (Create, Read, Update, Delete) operations with validation, pagination, filtering, and
          sorting for any data model.
        </p>
      </div>

      {/* Features Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What You Get</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Database className="w-6 h-6 text-blue-400 mb-2" />
              <CardTitle className="text-white">Complete CRUD Operations</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Create new records with validation</li>
                <li>• Read with filtering and search</li>
                <li>• Update existing records</li>
                <li>• Delete with soft delete option</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Filter className="w-6 h-6 text-green-400 mb-2" />
              <CardTitle className="text-white">Advanced Features</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Pagination with limit/offset</li>
                <li>• Field-based filtering</li>
                <li>• Full-text search</li>
                <li>• Multi-field sorting</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Code Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Generated Code Examples</h2>

        <Tabs defaultValue="routes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="controller">Controller</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">CRUD Routes</CardTitle>
                <CardDescription className="text-slate-400">src/routes/productRoutes.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateProduct } = require('../middleware/validation');

// GET /api/products - List products with filtering, pagination, search
router.get('/', productController.getProducts);

// GET /api/products/:id - Get single product
router.get('/:id', productController.getProduct);

// POST /api/products - Create new product (protected)
router.post('/', 
  authMiddleware, 
  validateProduct, 
  productController.createProduct
);

// PUT /api/products/:id - Update product (protected)
router.put('/:id', 
  authMiddleware, 
  validateProduct, 
  productController.updateProduct
);

// DELETE /api/products/:id - Delete product (protected)
router.delete('/:id', 
  authMiddleware, 
  productController.deleteProduct
);

module.exports = router;`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controller" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">CRUD Controller</CardTitle>
                <CardDescription className="text-slate-400">src/controllers/productController.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const productService = require('../services/productService');

const productController = {
  // GET /api/products
  async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filters = {};
      if (category) filters.category = category;
      if (minPrice) filters.price = { ...filters.price, $gte: minPrice };
      if (maxPrice) filters.price = { ...filters.price, $lte: maxPrice };

      const result = await productService.getProducts({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        filters,
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        data: result.products,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // GET /api/products/:id
  async getProduct(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          error: 'Product not found' 
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // POST /api/products
  async createProduct(req, res) {
    try {
      const productData = {
        ...req.body,
        createdBy: req.user.id
      };

      const product = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // PUT /api/products/:id
  async updateProduct(req, res) {
    try {
      const product = await productService.updateProduct(
        req.params.id, 
        req.body,
        req.user.id
      );

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          error: 'Product not found' 
        });
      }

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // DELETE /api/products/:id
  async deleteProduct(req, res) {
    try {
      const deleted = await productService.deleteProduct(
        req.params.id, 
        req.user.id
      );

      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          error: 'Product not found' 
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
};

module.exports = productController;`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Business Logic Service</CardTitle>
                <CardDescription className="text-slate-400">src/services/productService.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const Product = require('../models/Product');

const productService = {
  async getProducts({ page, limit, search, filters, sortBy, sortOrder }) {
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { ...filters };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name')
        .populate('createdBy', 'name email'),
      Product.countDocuments(query)
    ]);

    return {
      products,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };
  },

  async getProductById(id) {
    return await Product.findById(id)
      .populate('category', 'name')
      .populate('createdBy', 'name email');
  },

  async createProduct(productData) {
    const product = new Product(productData);
    await product.save();
    return await this.getProductById(product._id);
  },

  async updateProduct(id, updateData, userId) {
    const product = await Product.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return product ? await this.getProductById(product._id) : null;
  },

  async deleteProduct(id, userId) {
    // Soft delete - mark as deleted instead of removing
    const product = await Product.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { 
        isDeleted: true, 
        deletedAt: new Date(),
        deletedBy: userId 
      },
      { new: true }
    );
    
    return !!product;
  }
};

module.exports = productService;`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* API Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">API Usage Examples</h2>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                List Products with Filtering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="bash"
                code={`# Get products with pagination
GET /api/products?page=1&limit=10

# Search products
GET /api/products?search=laptop

# Filter by category and price range
GET /api/products?category=electronics&minPrice=100&maxPrice=1000

# Sort by price ascending
GET /api/products?sortBy=price&sortOrder=asc

# Combine filters
GET /api/products?search=gaming&category=electronics&minPrice=500&sortBy=rating&sortOrder=desc`}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="bash"
                code={`POST /api/products
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop with RTX graphics",
  "price": 1299.99,
  "category": "electronics",
  "tags": ["gaming", "laptop", "rtx"],
  "stock": 50,
  "images": ["image1.jpg", "image2.jpg"]
}`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
