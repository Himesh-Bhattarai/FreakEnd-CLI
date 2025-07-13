const mongoose = require('mongoose');
const User = require('../models/User');
const SeedDataGenerator = require('../utils/seedData');
const SeederUtils = require('../utils/seeder.utils');

class SeederService {
  async seedUsers(count = 10, userId) {
    const startTime = Date.now();
    
    try {
      // Clear existing seeded users
      await SeederUtils.clearCollection('User');
      
      // Generate users including default admin
      const users = [
        SeedDataGenerator.getDefaultAdmin(),
        ...SeedDataGenerator.generateUsers(count - 1)
      ];
      
      // Batch insert users
      const batchSize = parseInt(process.env.SEEDER_BATCH_SIZE) || 100;
      const insertedUsers = await SeederUtils.batchInsert(User, users, batchSize);
      
      const executionTime = Date.now() - startTime;
      
      // Log the operation
      await SeederUtils.logSeederOperation(
        'seed',
        'User',
        insertedUsers.length,
        userId,
        executionTime,
        null,
        { batchSize, seedType: 'users' }
      );
      
      return {
        success: true,
        count: insertedUsers.length,
        executionTime,
        data: insertedUsers.map(user => ({
          id: user._id,
          email: user.email,
          role: user.role
        }))
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await SeederUtils.logSeederOperation(
        'seed',
        'User',
        0,
        userId,
        executionTime,
        error,
        { seedType: 'users' }
      );
      
      throw error;
    }
  }

  async seedProducts(count = 20, userId) {
    const startTime = Date.now();
    
    try {
      // Check if Product model exists
      let Product;
      try {
        Product = mongoose.model('Product');
      } catch (error) {
        throw new Error('Product model not found. Please ensure Product model is defined.');
      }
      
      // Clear existing seeded products
      await SeederUtils.clearCollection('Product');
      
      // Generate products
      const products = SeedDataGenerator.generateProducts(count);
      
      // Batch insert products
      const batchSize = parseInt(process.env.SEEDER_BATCH_SIZE) || 100;
      const insertedProducts = await SeederUtils.batchInsert(Product, products, batchSize);
      
      const executionTime = Date.now() - startTime;
      
      // Log the operation
      await SeederUtils.logSeederOperation(
        'seed',
        'Product',
        insertedProducts.length,
        userId,
        executionTime,
        null,
        { batchSize, seedType: 'products' }
      );
      
      return {
        success: true,
        count: insertedProducts.length,
        executionTime,
        data: insertedProducts.map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category
        }))
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await SeederUtils.logSeederOperation(
        'seed',
        'Product',
        0,
        userId,
        executionTime,
        error,
        { seedType: 'products' }
      );
      
      throw error;
    }
  }

  async seedCategories(count = 10, userId) {
    const startTime = Date.now();
    
    try {
      // Check if Category model exists
      let Category;
      try {
        Category = mongoose.model('Category');
      } catch (error) {
        throw new Error('Category model not found. Please ensure Category model is defined.');
      }
      
      // Clear existing seeded categories
      await SeederUtils.clearCollection('Category');
      
      // Generate categories
      const categories = SeedDataGenerator.generateCategories(count);
      
      // Batch insert categories
      const batchSize = parseInt(process.env.SEEDER_BATCH_SIZE) || 100;
      const insertedCategories = await SeederUtils.batchInsert(Category, categories, batchSize);
      
      const executionTime = Date.now() - startTime;
      
      // Log the operation
      await SeederUtils.logSeederOperation(
        'seed',
        'Category',
        insertedCategories.length,
        userId,
        executionTime,
        null,
        { batchSize, seedType: 'categories' }
      );
      
      return {
        success: true,
        count: insertedCategories.length,
        executionTime,
        data: insertedCategories.map(category => ({
          id: category._id,
          name: category.name,
          slug: category.slug
        }))
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await SeederUtils.logSeederOperation(
        'seed',
        'Category',
        0,
        userId,
        executionTime,
        error,
        { seedType: 'categories' }
      );
      
      throw error;
    }
  }

  async seedAll(userId) {
    const startTime = Date.now();
    const results = {};
    
    try {
      // Seed users
      results.users = await this.seedUsers(15, userId);
      
      // Seed categories (if model exists)
      try {
        results.categories = await this.seedCategories(10, userId);
      } catch (error) {
        results.categories = { success: false, error: error.message };
      }
      
      // Seed products (if model exists)
      try {
        results.products = await this.seedProducts(30, userId);
      } catch (error) {
        results.products = { success: false, error: error.message };
      }
      
      const executionTime = Date.now() - startTime;
      
      // Log the operation
      await SeederUtils.logSeederOperation(
        'seed',
        'All',
        Object.values(results).reduce((sum, result) => sum + (result.count || 0), 0),
        userId,
        executionTime,
        null,
        { seedType: 'all' }
      );
      
      return {
        success: true,
        executionTime,
        results
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await SeederUtils.logSeederOperation(
        'seed',
        'All',
        0,
        userId,
        executionTime,
        error,
        { seedType: 'all' }
      );
      
      throw error;
    }
  }

  async resetDatabase(userId) {
    const startTime = Date.now();
    
    try {
      const collections = ['User', 'Product', 'Category'];
      const results = {};
      
      for (const collection of collections) {
        try {
          const deletedCount = await SeederUtils.clearCollection(collection);
          results[collection] = { success: true, deletedCount };
        } catch (error) {
          results[collection] = { success: false, error: error.message };
        }
      }
      
      const executionTime = Date.now() - startTime;
      
      // Log the operation
      await SeederUtils.logSeederOperation(
        'reset',
        'All',
        Object.values(results).reduce((sum, result) => sum + (result.deletedCount || 0), 0),
        userId,
        executionTime,
        null,
        { operation: 'reset' }
      );
      
      return {
        success: true,
        executionTime,
        results
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await SeederUtils.logSeederOperation(
        'reset',
        'All',
        0,
        userId,
        executionTime,
        error,
        { operation: 'reset' }
      );
      
      throw error;
    }
  }

  async getSeederStats() {
    try {
      const collections = ['User', 'Product', 'Category'];
      const stats = {};
      
      for (const collection of collections) {
        try {
          stats[collection] = await SeederUtils.getCollectionStats(collection);
        } catch (error) {
          stats[collection] = { error: error.message };
        }
      }
      
      // Get recent seeder logs
      const recentLogs = await mongoose.model('SeederLog')
        .find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('executedBy', 'firstName lastName email');
      
      return {
        success: true,
        stats,
        recentLogs
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SeederService();