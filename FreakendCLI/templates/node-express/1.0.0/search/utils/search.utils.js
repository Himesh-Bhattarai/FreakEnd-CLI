const mongoose = require('mongoose');

/**
 * Build search query with fuzzy matching
 * @param {string} query - Search query string
 * @param {Array} fields - Fields to search in
 * @param {Object} filters - Additional filters
 * @returns {Object} MongoDB query object
 */
const buildSearchQuery = (query, fields = [], filters = {}) => {
  const searchQuery = {};
  
  // Add text search if query is provided
  if (query && query.trim()) {
    const searchConditions = fields.map(field => ({
      [field]: {
        $regex: query.trim(),
        $options: 'i' // Case-insensitive
      }
    }));
    
    if (searchConditions.length > 0) {
      searchQuery.$or = searchConditions;
    }
  }
  
  // Add filters
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      // Handle array filters
      if (Array.isArray(filters[key])) {
        searchQuery[key] = { $in: filters[key] };
      }
      // Handle range filters (e.g., price)
      else if (typeof filters[key] === 'object' && filters[key].min !== undefined || filters[key].max !== undefined) {
        searchQuery[key] = {};
        if (filters[key].min !== undefined) searchQuery[key].$gte = filters[key].min;
        if (filters[key].max !== undefined) searchQuery[key].$lte = filters[key].max;
      }
      // Handle regular filters
      else {
        searchQuery[key] = filters[key];
      }
    }
  });
  
  return searchQuery;
};

/**
 * Build sort object from sort string
 * @param {string} sortString - Sort string (e.g., 'name,-createdAt')
 * @returns {Object} MongoDB sort object
 */
const buildSortQuery = (sortString) => {
  if (!sortString) return { createdAt: -1 }; // Default sort
  
  const sortObj = {};
  const sortFields = sortString.split(',');
  
  sortFields.forEach(field => {
    const trimmedField = field.trim();
    if (trimmedField.startsWith('-')) {
      sortObj[trimmedField.substring(1)] = -1;
    } else {
      sortObj[trimmedField] = 1;
    }
  });
  
  return sortObj;
};

/**
 * Validate and sanitize search parameters
 * @param {Object} params - Request query parameters
 * @returns {Object} Sanitized parameters
 */
const sanitizeSearchParams = (params) => {
  const {
    q = '',
    page = 1,
    limit = process.env.DEFAULT_SEARCH_LIMIT || 10,
    sort = 'createdAt',
    ...filters
  } = params;
  
  // Sanitize page and limit
  const sanitizedPage = Math.max(1, parseInt(page) || 1);
  const sanitizedLimit = Math.min(
    parseInt(limit) || 10,
    parseInt(process.env.MAX_SEARCH_LIMIT) || 100
  );
  
  // Sanitize query string
  const sanitizedQuery = q.toString().trim().substring(0, 200); // Limit query length
  
  // Sanitize sort
  const sanitizedSort = sort.toString().trim();
  
  // Sanitize filters (remove potentially dangerous operators)
  const sanitizedFilters = {};
  Object.keys(filters).forEach(key => {
    if (typeof filters[key] === 'string') {
      sanitizedFilters[key] = filters[key].trim();
    } else if (typeof filters[key] === 'number') {
      sanitizedFilters[key] = filters[key];
    } else if (Array.isArray(filters[key])) {
      sanitizedFilters[key] = filters[key].filter(item => 
        typeof item === 'string' || typeof item === 'number'
      );
    }
  });
  
  return {
    query: sanitizedQuery,
    page: sanitizedPage,
    limit: sanitizedLimit,
    sort: sanitizedSort,
    filters: sanitizedFilters
  };
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const calculatePagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Get searchable fields for a model
 * @param {string} modelName - Name of the model
 * @returns {Array} Array of searchable fields
 */
const getSearchableFields = (modelName) => {
  const fieldsMap = {
    User: ['name', 'email', 'department'],
    Item: ['title', 'description', 'tags'],
    Post: ['title', 'content', 'tags']
  };
  
  return fieldsMap[modelName] || [];
};

/**
 * Validate ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} Whether ID is valid
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
  buildSearchQuery,
  buildSortQuery,
  sanitizeSearchParams,
  calculatePagination,
  getSearchableFields,
  isValidObjectId
};