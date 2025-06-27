class MemoryStorage {
    constructor() {
      this.verifications = new Map();
      this.lastSentTimes = new Map();
    }
  
    async saveVerification(email, data) {
      this.verifications.set(email, data);
    }
  
    async getVerification(email) {
      return this.verifications.get(email) || null;
    }
  
    async deleteVerification(email) {
      this.verifications.delete(email);
    }
  
    async setLastSentTime(email, timestamp) {
      this.lastSentTimes.set(email, timestamp);
    }
  
    async getLastSentTime(email) {
      return this.lastSentTimes.get(email) || null;
    }
  
    async cleanup() {
      const now = new Date();
      for (const [email, data] of this.verifications.entries()) {
        if (new Date(data.expiresAt) < now) {
          this.verifications.delete(email);
          this.lastSentTimes.delete(email);
        }
      }
    }
  }
  
  module.exports.MemoryStorage = MemoryStorage;
  