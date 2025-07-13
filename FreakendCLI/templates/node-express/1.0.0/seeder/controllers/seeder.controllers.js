const SeederService = require('../services/seeder.services');
const SeederUtils = require('../utils/seeder.utils');

class SeederController {
  async seedUsers(req, res) {
    try {
      const { count = 10 } = req.body;
      
      if (count < 1 || count > 1000) {
        return res.status(400).json(
          SeederUtils.formatResponse(false, 'Count must be between 1 and 1000')
        );
      }
      
      const result = await SeederService.seedUsers(count, req.user._id);
      
      return res.status(200).json(
        SeederUtils.formatResponse(
          true,
          `Successfully seeded ${result.count} users`,
          result.data,
          { executionTime: result.executionTime }
        )
      );
    } catch (error) {
      console.error('Seed users error:', error);
      return res.status(500).json(
        SeederUtils.formatResponse(false, 'Failed to seed users', null, { error: error.message })
      );
    }
  }

  async seedProducts(req, res) {
    try {
      const { count = 20 } = req.body;
      
      if (count < 1 || count > 1000) {
        return res.status(400).json(
          SeederUtils.formatResponse(false, 'Count must be between 1 and 1000')
        );
      }
      
      const result = await SeederService.seedProducts(count, req.user._id);
      
      return res.status(200).json(
        SeederUtils.formatResponse(
          true,
          `Successfully seeded ${result.count} products`,
          result.data,
          { executionTime: result.executionTime }
        )
      );
    } catch (error) {
      console.error('Seed products error:', error);
      return res.status(500).json(
        SeederUtils.formatResponse(false, 'Failed to seed products', null, { error: error.message })
      );
    }
  }

  async seedCategories(req, res) {
    try {
      const { count = 10 } = req.body;
      
      if (count < 1 || count > 100) {
        return res.status(400).json(
          SeederUtils.formatResponse(false, 'Count must be between 1 and 100')
        );
      }
      
      const result = await SeederService.seedCategories(count, req.user._id);
      
      return res.status(200).json(
        SeederUtils.formatResponse(
          true,
          `Successfully seeded ${result.count} categories`,
          result.data,
          { executionTime: result.executionTime }
        )
      );
    } catch (error) {
      console.error('Seed categories error:', error);
      return res.status(500).json(
        SeederUtils.formatResponse(false, 'Failed to seed categories', null, { error: error.message })
      );
    }
  }

  async seedAll(req, res) {
    try {
      const result = await SeederService.seedAll(req.user._id);
      
      return res.status(200).json(
        SeederUtils.formatResponse(
          true,
          'Successfully seeded all collections',
          result.results,
          { executionTime: result.executionTime }
        )
      );
    } catch (error) {
      console.error('Seed all error:', error);
      return res.status(500).json(
        SeederUtils.formatResponse(false, 'Failed to seed all collections', null, { error: error.message })
      );
    }
  }

  async resetDatabase(req, res) {
    try {
      const result = await SeederService.resetDatabase(req.user._id);
      
      return res.status(200).json(
        SeederUtils.formatResponse(
          true,
          'Successfully reset database',
          result.results,
          { executionTime: result.executionTime }
        )
      );
    } catch (error) {
      console.error('Reset database error:', error);
      return res.status(500).json(
        SeederUtils.formatResponse(false, 'Failed to reset database', null, { error: error.message })
      );
    }
  }

  async getSeederStats(req, res) {
    try {
      const result = await SeederService.getSeederStats();
      
      return res.status(200).json(
        SeederUtils.formatResponse(
          true,
          'Seeder statistics retrieved successfully',
          result
        )
      );
    } catch (error) {
      console.error('Get seeder stats error:', error);
      return res.status(500).json(
        SeederUtils.formatResponse(false, 'Failed to get seeder statistics', null, { error: error.message })
      );
    }
  }
}

module.exports = new SeederController();