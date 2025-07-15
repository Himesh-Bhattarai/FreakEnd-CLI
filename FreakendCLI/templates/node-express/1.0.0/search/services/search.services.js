const { User, Item, Post } = require('../models/search.models');
const {
  buildSearchQuery,
  buildSortQuery,
  sanitizeSearchParams,
  calculatePagination,
  getSearchableFields
} = require('../utils/search.utils');

/**
 * Generic search service
 */
class SearchService {
  constructor() {
    this.models = {
      users: User,
      items: Item,
      posts: Post
    };
  }
  
  /**
   * Search resources with pagination and filtering
   * @param {string} resource - Resource type
   * @param {Object} params - Search parameters
   * @param {Object} user - Authenticated user
   * @returns {Object} Search results
   */
  async search(resource, params, user) {
    try {
      const Model = this.models[resource];
      if (!Model) {
        throw new Error(`Resource '${resource}' not found`);
      }
      
      const sanitizedParams = sanitizeSearchParams(params);
      const { query, page, limit, sort, filters } = sanitizedParams;
      
      // Get searchable fields for the model
      const modelName = Model.modelName;
      const searchableFields = getSearchableFields(modelName);
      
      // Build search query
      let searchQuery = buildSearchQuery(query, searchableFields, filters);
      
      // Apply resource-specific filters
      searchQuery = this.applyResourceFilters(resource, searchQuery, user);
      
      // Build sort query
      const sortQuery = buildSortQuery(sort);
      
      // Calculate skip value
      const skip = (page - 1) * limit;
      
      // Execute search with pagination
      const [results, total] = await Promise.all([
        Model.find(searchQuery)
          .sort(sortQuery)
          .skip(skip)
          .limit(limit)
          .populate(this.getPopulateFields(resource))
          .lean(),
        Model.countDocuments(searchQuery)
      ]);
      
      // Calculate pagination metadata
      const pagination = calculatePagination(total, page, limit);
      
      return {
        success: true,
        data: results,
        pagination,
        query: {
          resource,
          searchTerm: query,
          filters,
          sort
        }
      };
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
  
  /**
   * Apply resource-specific filters
   * @param {string} resource - Resource type
   * @param {Object} searchQuery - Base search query
   * @param {Object} user - Authenticated user
   * @returns {Object} Modified search query
   */
  applyResourceFilters(resource, searchQuery, user) {
    switch (resource) {
      case 'users':
        // Admin can search all users, regular users can only search active users
        if (user.role !== 'admin') {
          searchQuery.status = 'active';
        }
        break;
        
      case 'items':
        // Users can only search their own items unless they're admin
        if (user.role !== 'admin') {
          searchQuery.owner = user._id;
        }
        // Only show active items by default
        if (!searchQuery.status) {
          searchQuery.status = 'active';
        }
        break;
        
      case 'posts':
        // Users can only search public posts or their own posts
        if (user.role !== 'admin') {
          searchQuery.$or = [
            { isPublic: true, status: 'published' },
            { author: user._id }
          ];
        }
        break;
    }
    
    return searchQuery;
  }
  
  /**
   * Get populate fields for a resource
   * @param {string} resource - Resource type
   * @returns {string|Array} Populate fields
   */
  getPopulateFields(resource) {
    const populateMap = {
      users: '',
      items: 'owner',
      posts: 'author'
    };
    
    return populateMap[resource] || '';
  }
  
  /**
   * Get search suggestions
   * @param {string} resource - Resource type
   * @param {string} query - Search query
   * @param {Object} user - Authenticated user
   * @returns {Array} Search suggestions
   */
  async getSuggestions(resource, query, user) {
    try {
      const Model = this.models[resource];
      if (!Model) {
        throw new Error(`Resource '${resource}' not found`);
      }
      
      const searchableFields = getSearchableFields(Model.modelName);
      const searchQuery = buildSearchQuery(query, searchableFields);
      
      // Apply resource-specific filters
      const filteredQuery = this.applyResourceFilters(resource, searchQuery, user);
      
      // Get suggestions (limited to 5)
      const suggestions = await Model.find(filteredQuery)
        .select(searchableFields.join(' '))
        .limit(5)
        .lean();
      
      return {
        success: true,
        data: suggestions
      };
    } catch (error) {
      throw new Error(`Suggestions failed: ${error.message}`);
    }
  }
}

module.exports = new SearchService();