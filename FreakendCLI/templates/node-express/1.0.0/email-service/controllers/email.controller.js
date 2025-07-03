const EmailTemplate = require('../models/EmailTemplate');
const emailUtils = require('../utils/emailUtils');

class EmailController {
  // Send custom email
  async sendCustomEmail(req, res) {
    try {
      const { to, subject, html, text, attachments = [] } = req.body;

      const result = await emailUtils.sendEmail({
        to,
        subject,
        html: html || text,
        text: text || '',
        attachments
      });

      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        data: {
          messageId: result.messageId,
          to,
          subject
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: error.message
      });
    }
  }

  // Send bulk emails
  async sendBulkEmail(req, res) {
    try {
      const { recipients, subject, html, text, attachments = [] } = req.body;
      const results = [];
      const errors = [];

      // Send emails in batches to avoid overwhelming the SMTP server
      const batchSize = 10;
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const batchPromises = batch.map(async (recipient) => {
          try {
            const result = await emailUtils.sendEmail({
              to: recipient,
              subject,
              html: html || text,
              text: text || '',
              attachments
            });
            results.push({ email: recipient, success: true, messageId: result.messageId });
          } catch (error) {
            errors.push({ email: recipient, error: error.message });
          }
        });

        await Promise.all(batchPromises);
        
        // Small delay between batches
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      res.status(200).json({
        success: true,
        message: 'Bulk email process completed',
        data: {
          totalRecipients: recipients.length,
          successful: results.length,
          failed: errors.length,
          results,
          errors
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send bulk emails',
        error: error.message
      });
    }
  }

  // Send verification email
  async sendVerificationEmail(req, res) {
    try {
      const { email, userName } = req.body;
      const userId = req.user?.id || 'temp-user-id';

      // Generate verification token
      const verificationToken = emailUtils.generateEmailToken(
        { email, userId, type: 'verification' },
        '24h'
      );

      const verificationUrl = `${process.env.VERIFICATION_URL}?token=${verificationToken}`;
      const emailTemplate = emailUtils.getVerificationEmailTemplate(userName, verificationUrl);

      const result = await emailUtils.sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
        data: {
          messageId: result.messageId,
          email,
          expiresIn: '24 hours'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: error.message
      });
    }
  }

  // Verify email token
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      const decoded = emailUtils.verifyEmailToken(token);
      
      if (decoded.type !== 'verification') {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification token'
        });
      }

      // Here you would typically update user's email verification status
      // For now, we'll just return success
      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          email: decoded.email,
          userId: decoded.userId
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        error: error.message
      });
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(req, res) {
    try {
      const { email, userName } = req.body;
      const userId = req.user?.id || 'temp-user-id';

      // Generate reset token
      const resetToken = emailUtils.generateEmailToken(
        { email, userId, type: 'password-reset' },
        '1h'
      );

      const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${resetToken}`;
      const emailTemplate = emailUtils.getPasswordResetEmailTemplate(userName, resetUrl);

      const result = await emailUtils.sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
        data: {
          messageId: result.messageId,
          email,
          expiresIn: '1 hour'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: error.message
      });
    }
  }

  // Send welcome email
  async sendWelcomeEmail(req, res) {
    try {
      const { email, userName } = req.body;

      const emailTemplate = emailUtils.getWelcomeEmailTemplate(userName);

      const result = await emailUtils.sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      res.status(200).json({
        success: true,
        message: 'Welcome email sent successfully',
        data: {
          messageId: result.messageId,
          email
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
        error: error.message
      });
    }
  }

  // Create email template
  async createTemplate(req, res) {
    try {
      const { name, subject, htmlContent, textContent, variables } = req.body;
      const userId = req.user.id;

      const template = new EmailTemplate({
        name,
        subject,
        htmlContent,
        textContent,
        variables: variables || [],
        createdBy: userId
      });

      await template.save();

      res.status(201).json({
        success: true,
        message: 'Email template created successfully',
        data: template
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Template with this name already exists'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create email template',
        error: error.message
      });
    }
  }

  // Get all templates
  async getTemplates(req, res) {
    try {
      const { page = 1, limit = 10, isActive } = req.query;
      const query = {};
      
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const templates = await EmailTemplate.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await EmailTemplate.countDocuments(query);

      res.status(200).json({
        success: true,
        message: 'Templates retrieved successfully',
        data: {
          templates,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve templates',
        error: error.message
      });
    }
  }

  // Get template by ID
  async getTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await EmailTemplate.findById(id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Template retrieved successfully',
        data: template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve template',
        error: error.message
      });
    }
  }

  // Update template
  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const { name, subject, htmlContent, textContent, variables, isActive } = req.body;
      const userId = req.user.id;

      const template = await EmailTemplate.findByIdAndUpdate(
        id,
        {
          name,
          subject,
          htmlContent,
          textContent,
          variables,
          isActive,
          updatedBy: userId
        },
        { new: true, runValidators: true }
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Template updated successfully',
        data: template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update template',
        error: error.message
      });
    }
  }

  // Delete template
  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await EmailTemplate.findByIdAndDelete(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete template',
        error: error.message
      });
    }
  }

  // Send email using template
  async sendTemplateEmail(req, res) {
    try {
      const { to, variables = {} } = req.body;
      const template = req.template;

      // Replace variables in template
      const subject = emailUtils.replaceTemplateVariables(template.subject, variables);
      const html = emailUtils.replaceTemplateVariables(template.htmlContent, variables);
      const text = emailUtils.replaceTemplateVariables(template.textContent, variables);

      const result = await emailUtils.sendEmail({
        to,
        subject,
        html,
        text
      });

      res.status(200).json({
        success: true,
        message: 'Template email sent successfully',
        data: {
          messageId: result.messageId,
          to,
          templateName: template.name,
          subject
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send template email',
        error: error.message
      });
    }
  }
}

module.exports = new EmailController();