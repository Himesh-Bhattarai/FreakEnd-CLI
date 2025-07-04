const OpenAI = require('openai');
const Redis = require('ioredis');

class EmbeddingUtils {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.redis = new Redis(process.env.REDIS_URL);
    this.model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    this.cacheTTL = parseInt(process.env.CACHE_TTL) || 3600;
  }

  async generateEmbedding(text) {
    try {
      // Clean and prepare text
      const cleanText = this.preprocessText(text);
      
      // Check cache first
      const cacheKey = `embedding:${Buffer.from(cleanText).toString('base64')}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Generate embedding
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: cleanText
      });

      const embedding = response.data[0].embedding;
      
      // Cache the result
      await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(embedding));
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateBatchEmbeddings(texts) {
    try {
      const cleanTexts = texts.map(text => this.preprocessText(text));
      
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: cleanTexts
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw new Error('Failed to generate batch embeddings');
    }
  }

  preprocessText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.-]/g, '')
      .trim()
      .substring(0, 8000); // OpenAI embedding limit
  }

  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  async close() {
    await this.redis.quit();
  }
}

module.exports = EmbeddingUtils;