class RedisStorage {
    constructor(redisClient) {
      this.redis = redisClient;
    }
  
    async saveVerification(email, data) {
      const key = `email_verify:${email}`;
      await this.redis.setex(key, Math.ceil((data.expiresAt - Date.now()) / 1000), JSON.stringify(data));
    }
  
    async getVerification(email) {
      const key = `email_verify:${email}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    }
  
    async deleteVerification(email) {
      const key = `email_verify:${email}`;
      await this.redis.del(key);
    }
  
    async setLastSentTime(email, timestamp) {
      const key = `email_verify_sent:${email}`;
      await this.redis.setex(key, 300, timestamp.toString()); // 5 min expiry
    }
  
    async getLastSentTime(email) {
      const key = `email_verify_sent:${email}`;
      const timestamp = await this.redis.get(key);
      return timestamp ? parseInt(timestamp) : null;
    }
  }
  
  module.exports.RedisStorage = RedisStorage;