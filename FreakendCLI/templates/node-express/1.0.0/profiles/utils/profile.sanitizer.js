const DOMPurify = require('isomorphic-dompurify');

class ProfileSanitizer {
  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(content) {
    if (!content || typeof content !== 'string') return content;
    return DOMPurify.sanitize(content, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  // Sanitize profile data for output
  static sanitizeProfileOutput(profile) {
    if (!profile) return null;

    const sanitized = { ...profile };
    
    // Sanitize text fields
    if (sanitized.name) sanitized.name = this.sanitizeHtml(sanitized.name);
    if (sanitized.bio) sanitized.bio = this.sanitizeHtml(sanitized.bio);
    if (sanitized.location) sanitized.location = this.sanitizeHtml(sanitized.location);
    
    // Ensure avatar has fallback
    if (!sanitized.avatar) {
      sanitized.avatar = this.getDefaultAvatar(sanitized.name || 'User');
    }
    
    return sanitized;
  }

  // Generate default avatar URL
  static getDefaultAvatar(name) {
    const initial = (name || 'U').charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&size=200&background=random`;
  }

  // Sanitize input data
  static sanitizeProfileInput(data) {
    const sanitized = {};
    
    if (data.name) sanitized.name = this.sanitizeHtml(data.name.trim());
    if (data.bio) sanitized.bio = this.sanitizeHtml(data.bio.trim());
    if (data.location) sanitized.location = this.sanitizeHtml(data.location.trim());
    if (data.avatar) sanitized.avatar = data.avatar.trim();
    
    // Handle social links
    if (data.socialLinks) {
      sanitized.socialLinks = {};
      ['linkedin', 'github', 'twitter'].forEach(platform => {
        if (data.socialLinks[platform]) {
          sanitized.socialLinks[platform] = data.socialLinks[platform].trim();
        }
      });
    }
    
    return sanitized;
  }

  // Remove sensitive fields from user object
  static removeSensitiveFields(user) {
    const {
      password,
      __v,
      isAdmin,
      role,
      ...safeUser
    } = user;
    
    return safeUser;
  }
}

module.exports = ProfileSanitizer;