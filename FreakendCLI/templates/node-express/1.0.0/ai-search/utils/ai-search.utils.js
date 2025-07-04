const validator = require('validator');
const EmbeddingUtils = require('./embedding.utils');

class AISearchUtils {
  constructor() {
    this.embeddingUtils = new EmbeddingUtils();
  }

  validateSearchQuery(query) {
    const errors = [];

    if (!query || typeof query !== 'string') {
      errors.push('Query must be a non-empty string');
    } else {
      if (query.length < 2) {
        errors.push('Query must be at least 2 characters long');
      }
      if (query.length > 500) {
        errors.push('Query must be less than 500 characters');
      }
      if (!validator.isLength(query.trim(), { min: 2, max: 500 })) {
        errors.push('Query length is invalid');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateSearchFilters(filters) {
    const errors = [];
    const validCategories = ['article', 'product', 'document', 'faq', 'tutorial', 'other'];

    if (filters.category && !validCategories.includes(filters.category)) {
      errors.push('Invalid category filter');
    }

    if (filters.tags && (!Array.isArray(filters.tags) || filters.tags.some(tag => typeof tag !== 'string'))) {
      errors.push('Tags filter must be an array of strings');
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      if (start && !validator.isISO8601(start)) {
        errors.push('Invalid start date format');
      }
      if (end && !validator.isISO8601(end)) {
        errors.push('Invalid end date format');
      }
      if (start && end && new Date(start) > new Date(end)) {
        errors.push('Start date must be before end date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  sanitizeSearchQuery(query) {
    return validator.escape(query.trim());
  }

  buildSearchFilters(filters) {
    const mongoFilters = { isActive: true };

    if (filters.category) {
      mongoFilters.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      mongoFilters.tags = { $in: filters.tags };
    }

    if (filters.dateRange) {
      const dateFilter = {};
      if (filters.dateRange.start) {
        dateFilter.$gte = new Date(filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        dateFilter.$lte = new Date(filters.dateRange.end);
      }
      if (Object.keys(dateFilter).length > 0) {
        mongoFilters.createdAt = dateFilter;
      }
    }

    return mongoFilters;
  }

  async hybridSearch(query, items, queryEmbedding, options = {}) {
    const {
      textWeight = 0.3,
      semanticWeight = 0.7,
      limit = 20
    } = options;

    // Perform text search scoring
    const textScores = this.calculateTextScores(query, items);
    
    // Calculate semantic similarity scores
    const semanticScores = items.map(item => {
      if (!item.embedding || item.embedding.length === 0) {
        return 0;
      }
      return this.embeddingUtils.cosineSimilarity(queryEmbedding, item.embedding);
    });

    // Combine scores
    const combinedScores = items.map((item, index) => ({
      item,
      score: (textScores[index] * textWeight) + (semanticScores[index] * semanticWeight),
      textScore: textScores[index],
      semanticScore: semanticScores[index]
    }));

    // Sort by combined score and return top results
    return combinedScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateTextScores(query, items) {
    const queryWords = query.toLowerCase().split(/\s+/);
    
    return items.map(item => {
      const text = `${item.title} ${item.description} ${item.content} ${item.tags.join(' ')}`.toLowerCase();
      
      let score = 0;
      queryWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      
      // Normalize score by text length
      return score / Math.max(text.length / 1000, 1);
    });
  }

  formatSearchResults(results, query, searchType) {
    return results.map((result, index) => ({
      id: result.item._id,
      title: result.item.title,
      description: result.item.description,
      content: this.truncateContent(result.item.content, 200),
      category: result.item.category,
      tags: result.item.tags,
      metadata: result.item.metadata,
      score: result.score,
      rank: index + 1,
      searchType,
      highlights: this.generateHighlights(result.item, query)
    }));
  }

  truncateContent(content, maxLength) {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  generateHighlights(item, query) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const highlights = [];

    queryWords.forEach(word => {
      if (item.title.toLowerCase().includes(word)) {
        highlights.push({
          field: 'title',
          snippet: this.highlightText(item.title, word)
        });
      }
      if (item.description && item.description.toLowerCase().includes(word)) {
        highlights.push({
          field: 'description',
          snippet: this.highlightText(item.description, word)
        });
      }
    });

    return highlights;
  }

  highlightText(text, word) {
    const regex = new RegExp(`(${word})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  generateSessionId() {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = AISearchUtils;