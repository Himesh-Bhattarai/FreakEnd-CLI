const { validationResult } = require('express-validator');
const Conversation = require('../models/chatbot.conversation.model');
const Message = require('../models/chatbot.message.model');
const { generateChatResponse, calculateTokens } = require('../utils/chatbot.utils');

class ChatbotController {
  
  // Create new conversation
  async createConversation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { title, settings } = req.body;
      const userId = req.user.id;

      const conversation = new Conversation({
        userId,
        title,
        settings: settings || {}
      });

      await conversation.save();

      res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: conversation
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create conversation'
      });
    }
  }

  // Get user conversations
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, active = true } = req.query;

      const query = { userId };
      if (active !== 'all') {
        query.isActive = active === 'true';
      }

      const conversations = await Conversation.find(query)
        .sort({ lastActivity: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');

      const total = await Conversation.countDocuments(query);

      res.json({
        success: true,
        data: {
          conversations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations'
      });
    }
  }

  // Get conversation messages
  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 50 } = req.query;

      // Verify conversation ownership
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');

      const total = await Message.countDocuments({ conversationId });

      res.json({
        success: true,
        data: {
          messages,
          conversation,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages'
      });
    }
  }

  // Send message to chatbot
  async sendMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { conversationId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Verify conversation ownership
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId,
        isActive: true
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Active conversation not found'
        });
      }

      const startTime = Date.now();

      // Save user message
      const userMessage = new Message({
        conversationId,
        role: 'user',
        content,
        tokens: calculateTokens(content)
      });

      await userMessage.save();

      // Get recent conversation history
      const maxHistory = parseInt(process.env.CHATBOT_MAX_HISTORY) || 50;
      const recentMessages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(maxHistory)
        .select('role content');

      // Reverse to get chronological order
      const conversationHistory = recentMessages.reverse();

      // Generate AI response
      const aiResponse = await generateChatResponse(
        conversationHistory,
        conversation.settings
      );

      const responseTime = Date.now() - startTime;

      // Save AI response
      const aiMessage = new Message({
        conversationId,
        role: 'assistant',
        content: aiResponse.content,
        tokens: calculateTokens(aiResponse.content),
        metadata: {
          model: conversation.settings.model,
          temperature: conversation.settings.temperature,
          responseTime,
          cost: aiResponse.cost || 0
        }
      });

      await aiMessage.save();

      // Update conversation stats
      await Conversation.findByIdAndUpdate(conversationId, {
        $inc: { messageCount: 2 },
        lastActivity: new Date()
      });

      res.json({
        success: true,
        message: 'Message sent successfully',
        data: {
          userMessage,
          aiMessage,
          responseTime
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  }

  // Update conversation settings
  async updateConversation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { conversationId } = req.params;
      const { title, settings, isActive } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (settings !== undefined) updateData.settings = settings;
      if (isActive !== undefined) updateData.isActive = isActive;

      const conversation = await Conversation.findOneAndUpdate(
        { _id: conversationId, userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      res.json({
        success: true,
        message: 'Conversation updated successfully',
        data: conversation
      });
    } catch (error) {
      console.error('Update conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update conversation'
      });
    }
  }

  // Delete conversation
  async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      const conversation = await Conversation.findOneAndDelete({
        _id: conversationId,
        userId
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Delete all messages in the conversation
      await Message.deleteMany({ conversationId });

      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete conversation'
      });
    }
  }

  // Get chatbot statistics
  async getStats(req, res) {
    try {
      const userId = req.user.id;

      const [totalConversations, activeConversations, totalMessages] = await Promise.all([
        Conversation.countDocuments({ userId }),
        Conversation.countDocuments({ userId, isActive: true }),
        Message.countDocuments({
          conversationId: { $in: await Conversation.find({ userId }).distinct('_id') }
        })
      ]);

      // Get most active conversations
      const topConversations = await Conversation.find({ userId })
        .sort({ messageCount: -1 })
        .limit(5)
        .select('title messageCount lastActivity');

      res.json({
        success: true,
        data: {
          totalConversations,
          activeConversations,
          totalMessages,
          topConversations
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }
  }
}

module.exports = new ChatbotController();