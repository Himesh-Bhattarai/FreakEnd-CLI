const SearchableItem = require('../models/ai-search.model');
const SearchAnalytics = require('../models/search-analytics.model');
const EmbeddingUtils = require('../utils/embedding.utils');
const AISearchUtils = require('../utils/ai-search.utils');

class AISearchController {
  constructor() {
    this.embeddingUtils = new EmbeddingUtils();
    this.searchUtils = new AISearchUtils();
  }

  // Search items using AI
  async searchItems(req, res) {
    const startTime = Date.now();
    
    try {
      const {
        query,
        searchType = 'hybrid',
        filters = {},
        limit = 20,
        page = 1
      } = req.body;

      const sessionId = this.searchUtils.generateSessionId();
      const sanitizedQuery = this.searchUtils.sanitizeSearchQuery(query);

      // Build database filters
      const dbFilters = this.searchUtils.buildSearchFilters(filters);
      
      // Get items from database
      const skip = (page - 1) * limit;
      const items = await SearchableItem.find(dbFilters)
        .sort({ searchScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit * 3) // Get more items for better ranking
        .lean();

      let results = [];
      let finalSearchType = searchType;

      if (items.length === 0) {
        results = [];
      } else {
        switch (searchType) {
          case 'semantic':
            results = await this.performSemanticSearch(sanitizedQuery, items, limit);
            break;
          case 'text':
            results = this.performTextSearch(sanitizedQuery, items, limit);
            finalSearchType = 'text';
            break;
          case 'hybrid':
          default:
            results = await this.performHybridSearch(sanitizedQuery, items, limit);
            finalSearchType = 'hybrid';
            break;
        }
      }

      // Format results
      const formattedResults = this.searchUtils.formatSearchResults(results, sanitizedQuery, finalSearchType);
      
      // Record analytics
      const responseTime = Date.now() - startTime;
      await this.recordSearchAnalytics({
        query: sanitizedQuery,
        userId: req.user.id,
        searchType: finalSearchType,
        resultsCount: formattedResults.length,
        responseTime,
        filters,
        sessionId,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      res.json({
        success: true,
        data: {
          results: formattedResults,
          pagination: {
            page,
            limit,
            total: formattedResults.length,
            hasMore: results.length === limit
          },
          searchInfo: {
            query: sanitizedQuery,
            searchType: finalSearchType,
            responseTime,
            sessionId
          }
        }
      });

    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while searching',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Add new searchable item
  async addItem(req, res) {
    try {
      const {
        title,
        content,
        description,
        category = 'other',
        tags = [],
        metadata = {}
      } = req.body;

      // Generate embedding for the item
      const textToEmbed = `${title} ${description || ''} ${content}`;
      const embedding = await this.embeddingUtils.generateEmbedding(textToEmbed);

      // Create new item
      const newItem = new SearchableItem({
        title: title.trim(),
        content: content.trim(),
        description: description?.trim(),
        category,
        tags: tags.map(tag => tag.trim()),
        metadata,
        embedding,
        createdBy: req.user.id
      });

      await newItem.save();

      res.status(201).json({
        success: true,
        data: {
          id: newItem._id,
          title: newItem.title,
          category: newItem.category,
          tags: newItem.tags,
          createdAt: newItem.createdAt
        },
        message: 'Item added successfully'
      });

    } catch (error) {
      console.error('Add item error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while adding the item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update existing item
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        description,
        category,
        tags,
        metadata
      } = req.body;

      const item = await SearchableItem.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Check if user owns the item
      if (item.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this item'
        });
      }

      // Update fields
      if (title) item.title = title.trim();
      if (content) item.content = content.trim();
      if (description !== undefined) item.description = description?.trim();
      if (category) item.category = category;
      if (tags) item.tags = tags.map(tag => tag.trim());
      if (metadata) item.metadata = metadata;

      // Regenerate embedding if content changed
      if (title || content || description) {
        const textToEmbed = `${item.title} ${item.description || ''} ${item.content}`;
        item.embedding = await this.embeddingUtils.generateEmbedding(textToEmbed);
      }

      item.lastUpdated = new Date();
      await item.save();

      res.json({
        success: true,
        data: {
          id: item._id,
          title: item.title,
          category: item.category,
          tags: item.tags,
          lastUpdated: item.lastUpdated
        },
        message: 'Item updated successfully'
      });

    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while updating the item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete item
  async deleteItem(req, res) {
    try {
      const { id } = req.params;

      const item = await SearchableItem.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Check if user owns the item
      if (item.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this item'
        });
      }

      await SearchableItem.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Item deleted successfully'
      });

    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while deleting the item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's items
  async getUserItems(req, res) {
    try {
      const { page = 1, limit = 20, category, search } = req.query;
      const skip = (page - 1) * limit;

      const filters = {
        createdBy: req.user.id,
        isActive: true
      };

      if (category) {
        filters.category = category;
      }

      if (search) {
        filters.$text = { $search: search };
      }

      const items = await SearchableItem.find(filters)
        .select('title description category tags metadata createdAt lastUpdated')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await SearchableItem.countDocuments(filters);

      res.json({
        success: true,
        data: {
          items,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user items error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching items',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get search analytics
  async getSearchAnalytics(req, res) {
    try {
      const { startDate, endDate, limit = 100 } = req.query;
      
      const filters = { userId: req.user.id };
      
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate);
        if (endDate) filters.createdAt.$lte = new Date(endDate);
      }

      const analytics = await SearchAnalytics.find(filters)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

      // Aggregate statistics
      const stats = await SearchAnalytics.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            totalSearches: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            totalResults: { $sum: '$resultsCount' },
            searchTypes: {
              $push: '$searchType'
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          analytics,
          statistics: stats[0] || {
            totalSearches: 0,
            avgResponseTime: 0,
            totalResults: 0,
            searchTypes: []
          }
        }
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Record search click
  async recordSearchClick(req, res) {
    try {
      const { sessionId, itemId, rank } = req.body;

      if (!sessionId || !itemId || !rank) {
        return res.status(400).json({
          success: false,
          message: 'Session ID, item ID, and rank are required'
        });
      }

      // Find the search analytics record
      const searchRecord = await SearchAnalytics.findOne({
        sessionId,
        userId: req.user.id
      });

      if (!searchRecord) {
        return res.status(404).json({
          success: false,
          message: 'Search session not found'
        });
      }

      // Add click record
      searchRecord.clickedResults.push({
        itemId,
        rank,
        clickedAt: new Date()
      });

      await searchRecord.save();

      // Update item search score
      await SearchableItem.findByIdAndUpdate(itemId, {
        $inc: { searchScore: 1 }
      });

      res.json({
        success: true,
        message: 'Search click recorded successfully'
      });

    } catch (error) {
      console.error('Record click error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while recording the click',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get search suggestions
  async getSearchSuggestions(req, res) {
    try {
      const { query, limit = 5 } = req.query;

      if (!query || query.length < 2) {
        return res.json({
          success: true,
          data: { suggestions: [] }
        });
      }

      // Get popular searches
      const popularSearches = await SearchAnalytics.aggregate([
        {
          $match: {
            query: new RegExp(query, 'i'),
            userId: req.user.id
          }
        },
        {
          $group: {
            _id: '$query',
            count: { $sum: 1 },
            lastSearched: { $max: '$createdAt' }
          }
        },
        {
          $sort: { count: -1, lastSearched: -1 }
        },
        {
          $limit: parseInt(limit)
        }
      ]);

      // Get matching item titles
      const matchingItems = await SearchableItem.find({
        $or: [
          { title: new RegExp(query, 'i') },
          { tags: new RegExp(query, 'i') }
        ],
        isActive: true
      })
        .select('title')
        .limit(parseInt(limit))
        .lean();

      const suggestions = [
        ...popularSearches.map(s => ({ text: s._id, type: 'popular' })),
        ...matchingItems.map(item => ({ text: item.title, type: 'item' }))
      ].slice(0, parseInt(limit));

      res.json({
        success: true,
        data: { suggestions }
      });

    } catch (error) {
      console.error('Get suggestions error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Private methods
  async performSemanticSearch(query, items, limit) {
    const queryEmbedding = await this.embeddingUtils.generateEmbedding(query);
    
    const results = items.map(item => ({
      item,
      score: this.embeddingUtils.cosineSimilarity(queryEmbedding, item.embedding)
    }));

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  performTextSearch(query, items, limit) {
    const scores = this.searchUtils.calculateTextScores(query, items);
    
    const results = items.map((item, index) => ({
      item,
      score: scores[index]
    }));

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async performHybridSearch(query, items, limit) {
    const queryEmbedding = await this.embeddingUtils.generateEmbedding(query);
    
    return this.searchUtils.hybridSearch(query, items, queryEmbedding, {
      textWeight: 0.3,
      semanticWeight: 0.7,
      limit
    });
  }

  async recordSearchAnalytics(analyticsData) {
    try {
      const analytics = new SearchAnalytics(analyticsData);
      await analytics.save();
    } catch (error) {
      console.error('Error recording analytics:', error);
    }
  }
}

module.exports = new AISearchController();