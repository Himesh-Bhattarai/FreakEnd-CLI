const mongoose = require('mongoose');
const { SeederLog } = require('../models/seeder.models');

class SeederUtils {
  static async logSeederOperation(operation, model, recordsAffected, executedBy, executionTime, error = null, metadata = {}) {
    try {
      const log = new SeederLog({
        operation,
        model,
        recordsAffected,
        executedBy,
        executionTime,
        status: error ? 'failed' : 'success',
        error: error ? { message: error.message, stack: error.stack } : undefined,
        metadata: {
          ...metadata,
          environment: process.env.NODE_ENV || 'development'
        }
      });
      
      await log.save();
      return log;
    } catch (logError) {
      console.error('Failed to log seeder operation:', logError);
    }
  }

  static async clearCollection(modelName) {
    try {
      const Model = mongoose.model(modelName);
      const result = await Model.deleteMany({ isSeeded: true });
      return result.deletedCount;
    } catch (error) {
      throw new Error(`Failed to clear collection ${modelName}: ${error.message}`);
    }
  }

  static async getCollectionStats(modelName) {
    try {
      const Model = mongoose.model(modelName);
      const total = await Model.countDocuments();
      const seeded = await Model.countDocuments({ isSeeded: true });
      return { total, seeded, regular: total - seeded };
    } catch (error) {
      throw new Error(`Failed to get stats for ${modelName}: ${error.message}`);
    }
  }

  static validateSeederConfig() {
    const requiredEnvVars = ['SEEDER_SECRET', 'JWT_SECRET', 'MONGODB_URI'];
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (process.env.SEEDER_ENABLED !== 'true' && process.env.NODE_ENV === 'production') {
      throw new Error('Seeder is disabled in production environment');
    }
  }

  static sanitizeInput(input) {
    if (typeof input === 'string') {
      // Remove potential MongoDB injection patterns
      return input.replace(/[\$\{\}]/g, '');
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        if (!key.startsWith('$')) {
          sanitized[key] = this.sanitizeInput(value);
        }
      }
      return sanitized;
    }
    
    return input;
  }

  static async checkDatabaseConnection() {
    try {
      const state = mongoose.connection.readyState;
      if (state !== 1) {
        throw new Error('Database not connected');
      }
      return true;
    } catch (error) {
      throw new Error(`Database connection check failed: ${error.message}`);
    }
  }

  static formatResponse(success, message, data = null, meta = {}) {
    return {
      success,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  static async batchInsert(Model, data, batchSize = 100) {
    const results = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchResult = await Model.insertMany(batch, { ordered: false });
      results.push(...batchResult);
    }
    
    return results;
  }
}

module.exports = SeederUtils;