const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate chat response using OpenAI
 * @param {Array} messages - Conversation history
 * @param {Object} settings - Chat settings
 * @returns {Object} Response with content and metadata
 */
async function generateChatResponse(messages, settings = {}) {
  try {
    const {
      model = process.env.CHATBOT_DEFAULT_MODEL || 'gpt-3.5-turbo',
      temperature = parseFloat(process.env.CHATBOT_TEMPERATURE) || 0.7,
      maxTokens = parseInt(process.env.CHATBOT_MAX_TOKENS) || 150
    } = settings;

    // Format messages for OpenAI API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await openai.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const choice = response.choices[0];
    const usage = response.usage;

    return {
      content: choice.message.content,
      cost: calculateCost(usage, model),
      tokens: usage.completion_tokens,
      totalTokens: usage.total_tokens
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key');
    } else if (error.code === 'model_not_found') {
      throw new Error('Requested model not available');
    } else {
      throw new Error('Failed to generate response');
    }
  }
}

/**
 * Calculate approximate token count for text
 * @param {string} text - Text to count tokens for
 * @returns {number} Approximate token count
 */
function calculateTokens(text) {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Calculate cost based on token usage and model
 * @param {Object} usage - Token usage from OpenAI
 * @param {string} model - Model used
 * @returns {number} Cost in USD
 */
function calculateCost(usage, model) {
  const pricing = {
    'gpt-3.5-turbo': {
      input: 0.0015 / 1000, // $0.0015 per 1K tokens
      output: 0.002 / 1000  // $0.002 per 1K tokens
    },
    'gpt-4': {
      input: 0.03 / 1000,   // $0.03 per 1K tokens
      output: 0.06 / 1000   // $0.06 per 1K tokens
    },
    'gpt-4-turbo-preview': {
      input: 0.01 / 1000,   // $0.01 per 1K tokens
      output: 0.03 / 1000   // $0.03 per 1K tokens
    }
  };

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
  
  return (usage.prompt_tokens * modelPricing.input) + 
         (usage.completion_tokens * modelPricing.output);
}

/**
 * Sanitize user input
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 10000); // Limit length
}

/**
 * Generate conversation title from first message
 * @param {string} firstMessage - First user message
 * @returns {string} Generated title
 */
function generateConversationTitle(firstMessage) {
  const words = firstMessage.split(' ').slice(0, 8);
  let title = words.join(' ');
  
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title || 'New Conversation';
}

module.exports = {
  generateChatResponse,
  calculateTokens,
  calculateCost,
  sanitizeInput,
  generateConversationTitle
};