import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/alert"
import { Mail, Send, LayoutTemplateIcon as Template, BarChart } from "lucide-react"

export default function EmailDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
            CLI Command
          </Badge>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
            Email Service
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">frx add email -en</h1>
        <p className="text-xl text-slate-300 max-w-3xl">
          Generate complete email service with templates, queues, delivery tracking, and integration with popular email
          providers like SendGrid, Mailgun, and AWS SES.
        </p>
      </div>

      <Alert className="mb-8 border-green-700/30 bg-green-950/30">
        <Send className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          <strong>Production Ready:</strong> Includes email queues, retry logic, bounce handling, and comprehensive
          delivery tracking for reliable email delivery.
        </AlertDescription>
      </Alert>

      {/* Features Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Email Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Mail className="w-6 h-6 text-blue-400 mb-2" />
              <CardTitle className="text-white">Email Sending</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Transactional emails</li>
                <li>• Bulk email campaigns</li>
                <li>• Scheduled sending</li>
                <li>• Priority queues</li>
                <li>• Retry mechanisms</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Template className="w-6 h-6 text-purple-400 mb-2" />
              <CardTitle className="text-white">Templates</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• HTML & text templates</li>
                <li>• Dynamic content</li>
                <li>• Personalization</li>
                <li>• Multi-language support</li>
                <li>• Template versioning</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <BarChart className="w-6 h-6 text-green-400 mb-2" />
              <CardTitle className="text-white">Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Delivery tracking</li>
                <li>• Open & click rates</li>
                <li>• Bounce handling</li>
                <li>• Unsubscribe management</li>
                <li>• Performance metrics</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Send className="w-6 h-6 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Providers</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• SendGrid integration</li>
                <li>• Mailgun support</li>
                <li>• AWS SES</li>
                <li>• Postmark</li>
                <li>• SMTP fallback</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Code */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Generated Code Examples</h2>

        <Tabs defaultValue="service" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="service" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Email Service</CardTitle>
                <CardDescription className="text-slate-400">src/services/emailService.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const sgMail = require('@sendgrid/mail');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const emailQueue = require('../queues/emailQueue');
const EmailLog = require('../models/EmailLog');

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  constructor() {
    this.templates = new Map();
    this.loadTemplates();
  }

  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email');
      const templateFiles = await fs.readdir(templatesDir);

      for (const file of templateFiles) {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templateContent = await fs.readFile(
            path.join(templatesDir, file), 
            'utf8'
          );
          this.templates.set(templateName, handlebars.compile(templateContent));
        }
      }
    } catch (error) {
      console.error('Failed to load email templates:', error);
    }
  }

  async sendEmail(emailData) {
    try {
      const {
        to,
        from = process.env.DEFAULT_FROM_EMAIL,
        subject,
        template,
        data = {},
        priority = 'normal',
        scheduleAt = null
      } = emailData;

      // Generate unique tracking ID
      const trackingId = this.generateTrackingId();

      // Prepare email content
      let html, text;
      if (template && this.templates.has(template)) {
        html = this.templates.get(template)({
          ...data,
          trackingId,
          unsubscribeUrl: \`\${process.env.BASE_URL}/unsubscribe?token=\${trackingId}\`
        });
        
        // Generate text version from HTML
        text = this.htmlToText(html);
      } else {
        html = emailData.html;
        text = emailData.text;
      }

      const emailPayload = {
        to: Array.isArray(to) ? to : [to],
        from: {
          email: from,
          name: process.env.FROM_NAME || 'Your App'
        },
        subject,
        html,
        text,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        },
        customArgs: {
          trackingId
        }
      };

      // Log email attempt
      const emailLog = new EmailLog({
        trackingId,
        to: emailPayload.to,
        from: emailPayload.from.email,
        subject,
        template,
        status: 'queued',
        scheduledAt: scheduleAt,
        metadata: data
      });
      await emailLog.save();

      // Queue email for sending
      if (scheduleAt) {
        await emailQueue.add('send-scheduled-email', emailPayload, {
          delay: new Date(scheduleAt) - new Date(),
          priority: this.getPriorityValue(priority)
        });
      } else {
        await emailQueue.add('send-email', emailPayload, {
          priority: this.getPriorityValue(priority)
        });
      }

      return {
        success: true,
        trackingId,
        message: 'Email queued for delivery'
      };
    } catch (error) {
      console.error('Email service error:', error);
      throw new Error(\`Failed to send email: \${error.message}\`);
    }
  }

  async sendBulkEmail(recipients, emailTemplate) {
    try {
      const bulkEmails = recipients.map(recipient => ({
        ...emailTemplate,
        to: recipient.email,
        data: {
          ...emailTemplate.data,
          ...recipient.data
        }
      }));

      const results = await Promise.allSettled(
        bulkEmails.map(email => this.sendEmail(email))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        total: recipients.length,
        successful,
        failed,
        results
      };
    } catch (error) {
      throw new Error(\`Bulk email failed: \${error.message}\`);
    }
  }

  async sendTransactionalEmail(type, recipient, data = {}) {
    const templates = {
      welcome: {
        subject: 'Welcome to {{appName}}!',
        template: 'welcome'
      },
      passwordReset: {
        subject: 'Reset Your Password',
        template: 'password-reset'
      },
      emailVerification: {
        subject: 'Verify Your Email Address',
        template: 'email-verification'
      },
      orderConfirmation: {
        subject: 'Order Confirmation #{{orderNumber}}',
        template: 'order-confirmation'
      },
      paymentReceipt: {
        subject: 'Payment Receipt',
        template: 'payment-receipt'
      }
    };

    const templateConfig = templates[type];
    if (!templateConfig) {
      throw new Error(\`Unknown email template: \${type}\`);
    }

    return await this.sendEmail({
      to: recipient,
      subject: handlebars.compile(templateConfig.subject)(data),
      template: templateConfig.template,
      data,
      priority: 'high'
    });
  }

  async getEmailStatus(trackingId) {
    try {
      const emailLog = await EmailLog.findOne({ trackingId });
      if (!emailLog) {
        throw new Error('Email not found');
      }

      return {
        trackingId,
        status: emailLog.status,
        sentAt: emailLog.sentAt,
        deliveredAt: emailLog.deliveredAt,
        openedAt: emailLog.openedAt,
        clickedAt: emailLog.clickedAt,
        bounced: emailLog.bounced,
        bounceReason: emailLog.bounceReason
      };
    } catch (error) {
      throw new Error(\`Failed to get email status: \${error.message}\`);
    }
  }

  generateTrackingId() {
    return \`email_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  getPriorityValue(priority) {
    const priorities = {
      low: 1,
      normal: 5,
      high: 10,
      critical: 15
    };
    return priorities[priority] || 5;
  }

  htmlToText(html) {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\\s+/g, ' ')
      .trim();
  }
}

module.exports = new EmailService();`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Email Templates</CardTitle>
                <CardDescription className="text-slate-400">src/templates/email/welcome.hbs</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="html"
                  code={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{appName}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to {{appName}}!</h1>
  </div>
  
  <div class="content">
    <h2>Hi {{name}},</h2>
    
    <p>Welcome to {{appName}}! We're excited to have you on board.</p>
    
    <p>Your account has been successfully created with the email address: <strong>{{email}}</strong></p>
    
    {{#if verificationRequired}}
    <p>To get started, please verify your email address by clicking the button below:</p>
    
    <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
    
    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    <p><a href="{{verificationUrl}}">{{verificationUrl}}</a></p>
    {{else}}
    <p>You can now start using all the features of {{appName}}:</p>
    
    <ul>
      <li>Access your dashboard</li>
      <li>Customize your profile</li>
      <li>Explore our features</li>
    </ul>
    
    <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
    {{/if}}
    
    <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
    
    <p>Thanks again for joining us!</p>
    
    <p>Best regards,<br>The {{appName}} Team</p>
  </div>
  
  <div class="footer">
    <p>You received this email because you signed up for {{appName}}.</p>
    <p>If you didn't sign up, you can safely ignore this email.</p>
    <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{supportUrl}}">Contact Support</a></p>
    
    <!-- Tracking pixel -->
    <img src="{{baseUrl}}/api/email/track/open/{{trackingId}}" width="1" height="1" style="display:none;">
  </div>
</body>
</html>`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Email Queue</CardTitle>
                <CardDescription className="text-slate-400">src/queues/emailQueue.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const Bull = require('bull');
const sgMail = require('@sendgrid/mail');
const EmailLog = require('../models/EmailLog');

// Create email queue
const emailQueue = new Bull('email queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

// Process email jobs
emailQueue.process('send-email', async (job) => {
  const { data: emailData } = job;
  
  try {
    // Update status to sending
    await EmailLog.findOneAndUpdate(
      { trackingId: emailData.customArgs.trackingId },
      { status: 'sending', sentAt: new Date() }
    );

    // Send email via SendGrid
    const result = await sgMail.send(emailData);
    
    // Update status to sent
    await EmailLog.findOneAndUpdate(
      { trackingId: emailData.customArgs.trackingId },
      { 
        status: 'sent',
        messageId: result[0].headers['x-message-id'],
        deliveredAt: new Date()
      }
    );

    return { success: true, messageId: result[0].headers['x-message-id'] };
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Update status to failed
    await EmailLog.findOneAndUpdate(
      { trackingId: emailData.customArgs.trackingId },
      { 
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      }
    );

    throw error;
  }
});

// Process scheduled emails
emailQueue.process('send-scheduled-email', async (job) => {
  // Same logic as send-email but for scheduled emails
  return emailQueue.add('send-email', job.data);
});

// Handle failed jobs
emailQueue.on('failed', async (job, err) => {
  console.error(\`Email job \${job.id} failed:\`, err);
  
  // Implement retry logic
  const maxRetries = 3;
  const retryCount = job.attemptsMade;
  
  if (retryCount < maxRetries) {
    // Retry with exponential backoff
    const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    
    await emailQueue.add('send-email', job.data, {
      delay,
      attempts: maxRetries,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
  } else {
    // Mark as permanently failed
    await EmailLog.findOneAndUpdate(
      { trackingId: job.data.customArgs?.trackingId },
      { 
        status: 'permanently_failed',
        error: err.message,
        failedAt: new Date()
      }
    );
  }
});

// Handle completed jobs
emailQueue.on('completed', (job, result) => {
  console.log(\`Email job \${job.id} completed successfully\`);
});

// Clean up old jobs
emailQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Remove completed jobs after 24 hours
emailQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Remove failed jobs after 7 days

module.exports = emailQueue;`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Email Tracking</CardTitle>
                <CardDescription className="text-slate-400">src/controllers/emailTrackingController.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const EmailLog = require('../models/EmailLog');

const emailTrackingController = {
  // Track email opens
  async trackOpen(req, res) {
    try {
      const { trackingId } = req.params;
      
      await EmailLog.findOneAndUpdate(
        { trackingId, openedAt: null },
        { 
          openedAt: new Date(),
          opens: { $inc: 1 },
          lastOpenedAt: new Date(),
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        }
      );

      // Return 1x1 transparent pixel
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      
      res.set({
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      
      res.send(pixel);
    } catch (error) {
      console.error('Open tracking error:', error);
      res.status(200).send(); // Always return success for tracking
    }
  },

  // Track email clicks
  async trackClick(req, res) {
    try {
      const { trackingId, url } = req.params;
      const decodedUrl = decodeURIComponent(url);
      
      await EmailLog.findOneAndUpdate(
        { trackingId },
        { 
          $push: {
            clicks: {
              url: decodedUrl,
              clickedAt: new Date(),
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip
            }
          },
          $inc: { totalClicks: 1 },
          lastClickedAt: new Date()
        }
      );

      // Redirect to original URL
      res.redirect(decodedUrl);
    } catch (error) {
      console.error('Click tracking error:', error);
      res.redirect(req.params.url); // Redirect anyway
    }
  },

  // Handle unsubscribe
  async unsubscribe(req, res) {
    try {
      const { token } = req.query;
      
      const emailLog = await EmailLog.findOne({ trackingId: token });
      if (!emailLog) {
        return res.status(404).json({
          success: false,
          error: 'Invalid unsubscribe token'
        });
      }

      // Mark as unsubscribed
      await EmailLog.findOneAndUpdate(
        { trackingId: token },
        { 
          unsubscribedAt: new Date(),
          status: 'unsubscribed'
        }
      );

      // Add to global unsubscribe list
      const UnsubscribeList = require('../models/UnsubscribeList');
      await UnsubscribeList.findOneAndUpdate(
        { email: emailLog.to[0] },
        { 
          email: emailLog.to[0],
          unsubscribedAt: new Date(),
          source: 'email_link'
        },
        { upsert: true }
      );

      res.json({
        success: true,
        message: 'Successfully unsubscribed'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Webhook for SendGrid events
  async handleWebhook(req, res) {
    try {
      const events = req.body;
      
      for (const event of events) {
        const { sg_message_id, event: eventType, timestamp } = event;
        const trackingId = event.customArgs?.trackingId;
        
        if (!trackingId) continue;

        const updateData = {
          lastEventAt: new Date(timestamp * 1000)
        };

        switch (eventType) {
          case 'delivered':
            updateData.status = 'delivered';
            updateData.deliveredAt = new Date(timestamp * 1000);
            break;
            
          case 'open':
            updateData.openedAt = updateData.openedAt || new Date(timestamp * 1000);
            updateData.$inc = { opens: 1 };
            break;
            
          case 'click':
            updateData.lastClickedAt = new Date(timestamp * 1000);
            updateData.$inc = { totalClicks: 1 };
            updateData.$push = {
              clicks: {
                url: event.url,
                clickedAt: new Date(timestamp * 1000)
              }
            };
            break;
            
          case 'bounce':
            updateData.status = 'bounced';
            updateData.bounced = true;
            updateData.bounceReason = event.reason;
            updateData.bounceType = event.type;
            break;
            
          case 'dropped':
            updateData.status = 'dropped';
            updateData.dropReason = event.reason;
            break;
            
          case 'spam_report':
            updateData.status = 'spam';
            updateData.spamReported = true;
            break;
            
          case 'unsubscribe':
            updateData.status = 'unsubscribed';
            updateData.unsubscribedAt = new Date(timestamp * 1000);
            break;
        }

        await EmailLog.findOneAndUpdate(
          { trackingId },
          updateData
        );
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Error');
    }
  },

  // Get email analytics
  async getAnalytics(req, res) {
    try {
      const { startDate, endDate, template } = req.query;
      
      const matchConditions = {};
      if (startDate && endDate) {
        matchConditions.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      if (template) {
        matchConditions.template = template;
      }

      const analytics = await EmailLog.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalSent: { $sum: 1 },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            opened: { $sum: { $cond: [{ $ne: ['$openedAt', null] }, 1, 0] } },
            clicked: { $sum: { $cond: [{ $gt: ['$totalClicks', 0] }, 1, 0] } },
            bounced: { $sum: { $cond: [{ $eq: ['$bounced', true] }, 1, 0] } },
            unsubscribed: { $sum: { $cond: [{ $ne: ['$unsubscribedAt', null] }, 1, 0] } }
          }
        }
      ]);

      const stats = analytics[0] || {
        totalSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      };

      // Calculate rates
      const deliveryRate = stats.totalSent > 0 ? (stats.delivered / stats.totalSent * 100).toFixed(2) : 0;
      const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered * 100).toFixed(2) : 0;
      const clickRate = stats.delivered > 0 ? (stats.clicked / stats.delivered * 100).toFixed(2) : 0;
      const bounceRate = stats.totalSent > 0 ? (stats.bounced / stats.totalSent * 100).toFixed(2) : 0;

      res.json({
        success: true,
        data: {
          ...stats,
          deliveryRate: parseFloat(deliveryRate),
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
          bounceRate: parseFloat(bounceRate)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = emailTrackingController;`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
