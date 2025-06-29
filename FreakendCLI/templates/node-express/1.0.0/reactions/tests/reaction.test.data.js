const mongoose = require('mongoose');

// Test data for reactions
const testData = {
  // Sample user IDs (replace with actual user IDs from your system)
  users: [
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439015')
  ],

  // Sample content IDs (replace with actual content IDs from your system)
  content: [
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439023'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439024'),
    new mongoose.Types.ObjectId('507f1f77bcf86cd799439025')
  ],

  // Sample reactions for testing
  reactions: [
    {
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      contentId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      reactionType: 'like'
    },
    {
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      contentId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      reactionType: '❤️'
    },
    {
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      contentId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      reactionType: '🔥'
    },
    {
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
      contentId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
      reactionType: 'dislike'
    },
    {
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'),
      contentId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
      reactionType: '😢'
    }
  ],

  // JWT tokens for testing (replace with actual tokens)
  tokens: {
    user1: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTY0MDk5NTIwMH0.example',
    user2: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMiIsImlhdCI6MTY0MDk5NTIwMH0.example'
  }
};

module.exports = testData;