const searchService = require('../services/search.services');

/**
 * Search controller
 */
class SearchController {
  /**
   * Search resources
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async search(req, res) {
    try {
      const { resource } = req.params;
      const user = req.user;
      
      const result = await searchService.search(resource, req.query, user);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Get search suggestions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSuggestions(req, res) {
    try {
      const { resource } = req.params;
      const { q } = req.query;
      const user = req.user;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Query must be at least 2 characters long'
        });
      }
      
      const result = await searchService.getSuggestions(resource, q, user);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Get available search resources
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getResources(req, res) {
    try {
      const resources = [
        {
          name: 'users',
          searchableFields: ['name', 'email', 'department'],
          filters: ['role', 'status', 'department']
        },
        {
          name: 'items',
          searchableFields: ['title', 'description', 'tags'],
          filters: ['category', 'status', 'price']
        },
        {
          name: 'posts',
          searchableFields: ['title', 'content', 'tags'],
          filters: ['category', 'status', 'author']
        }
      ];
      
      res.status(200).json({
        success: true,
        data: resources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SearchController();