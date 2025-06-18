import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Shield, Webhook } from "lucide-react"

export default function PaymentDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
            CLI Command
          </Badge>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
            Payment Processing
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">frx add payment -en</h1>
        <p className="text-xl text-slate-300 max-w-3xl">
          Generate complete payment processing system with Stripe integration, webhooks, subscription handling, and
          secure payment flows.
        </p>
      </div>

      <Alert className="mb-8 border-blue-700/30 bg-blue-950/30">
        <Shield className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <strong>Security First:</strong> All payment implementations follow PCI DSS compliance standards and never
          store sensitive card data on your servers.
        </AlertDescription>
      </Alert>

      {/* Features Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Payment Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CreditCard className="w-6 h-6 text-green-400 mb-2" />
              <CardTitle className="text-white">Payment Processing</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• One-time payments with Stripe</li>
                <li>• Subscription billing & management</li>
                <li>• Payment method storage</li>
                <li>• Refunds & partial refunds</li>
                <li>• Multi-currency support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <Webhook className="w-6 h-6 text-blue-400 mb-2" />
              <CardTitle className="text-white">Webhooks & Events</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2 text-sm">
                <li>• Stripe webhook handling</li>
                <li>• Payment status updates</li>
                <li>• Subscription lifecycle events</li>
                <li>• Failed payment recovery</li>
                <li>• Invoice generation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Code */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Generated Code Examples</h2>

        <Tabs defaultValue="routes" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="controller">Controller</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Payment Routes</CardTitle>
                <CardDescription className="text-slate-400">src/routes/paymentRoutes.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { validatePayment } = require('../middleware/validation');

// Payment Intent Routes
router.post('/create-payment-intent', 
  authMiddleware, 
  validatePayment, 
  paymentController.createPaymentIntent
);

router.post('/confirm-payment', 
  authMiddleware, 
  paymentController.confirmPayment
);

// Subscription Routes
router.post('/create-subscription', 
  authMiddleware, 
  paymentController.createSubscription
);

router.post('/cancel-subscription/:id', 
  authMiddleware, 
  paymentController.cancelSubscription
);

// Payment Methods
router.get('/payment-methods', 
  authMiddleware, 
  paymentController.getPaymentMethods
);

router.post('/payment-methods', 
  authMiddleware, 
  paymentController.addPaymentMethod
);

router.delete('/payment-methods/:id', 
  authMiddleware, 
  paymentController.removePaymentMethod
);

// Webhooks (no auth required)
router.post('/webhook', paymentController.handleWebhook);

// Admin Routes
router.get('/transactions', 
  authMiddleware, 
  paymentController.getTransactions
);

router.post('/refund/:paymentId', 
  authMiddleware, 
  paymentController.createRefund
);

module.exports = router;`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controller" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Payment Controller</CardTitle>
                <CardDescription className="text-slate-400">src/controllers/paymentController.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentService = require('../services/paymentService');

const paymentController = {
  async createPaymentIntent(req, res) {
    try {
      const { amount, currency = 'usd', metadata = {} } = req.body;
      const userId = req.user.id;

      // Create customer if doesn't exist
      let customer = await paymentService.getOrCreateCustomer(userId);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customer.stripeCustomerId,
        metadata: {
          userId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Save payment intent to database
      await paymentService.createPaymentRecord({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: 'pending',
        metadata
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  async confirmPayment(req, res) {
    try {
      const { paymentIntentId } = req.body;
      const userId = req.user.id;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.metadata.userId !== userId.toString()) {
        return res.status(403).json({ 
          success: false, 
          error: 'Unauthorized' 
        });
      }

      // Update payment record
      await paymentService.updatePaymentStatus(
        paymentIntentId, 
        paymentIntent.status
      );

      res.json({
        success: true,
        status: paymentIntent.status,
        paymentIntent
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  async createSubscription(req, res) {
    try {
      const { priceId, paymentMethodId } = req.body;
      const userId = req.user.id;

      const customer = await paymentService.getOrCreateCustomer(userId);

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.stripeCustomerId,
      });

      // Set as default payment method
      await stripe.customers.update(customer.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.stripeCustomerId,
        items: [{ price: priceId }],
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to database
      await paymentService.createSubscription({
        userId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status: subscription.status
      });

      res.json({
        success: true,
        subscription,
        clientSecret: subscription.latest_invoice.payment_intent?.client_secret
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, 
        sig, 
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(\`Webhook Error: \${err.message}\`);
    }

    try {
      await paymentService.handleWebhookEvent(event);
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handling failed:', error);
      res.status(500).json({ error: 'Webhook handling failed' });
    }
  }
};

module.exports = paymentController;`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Webhook Handler</CardTitle>
                <CardDescription className="text-slate-400">src/services/webhookService.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const paymentService = require('./paymentService');
const emailService = require('./emailService');

const webhookService = {
  async handleWebhookEvent(event) {
    console.log(\`Received webhook: \${event.type}\`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
        
      default:
        console.log(\`Unhandled event type: \${event.type}\`);
    }
  },

  async handlePaymentSucceeded(paymentIntent) {
    try {
      // Update payment status in database
      await paymentService.updatePaymentStatus(
        paymentIntent.id, 
        'succeeded'
      );

      // Get user info
      const userId = paymentIntent.metadata.userId;
      if (userId) {
        // Send confirmation email
        await emailService.sendPaymentConfirmation(userId, {
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          paymentIntentId: paymentIntent.id
        });

        // Trigger any post-payment actions
        await this.triggerPostPaymentActions(userId, paymentIntent);
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  },

  async handlePaymentFailed(paymentIntent) {
    try {
      await paymentService.updatePaymentStatus(
        paymentIntent.id, 
        'failed'
      );

      const userId = paymentIntent.metadata.userId;
      if (userId) {
        await emailService.sendPaymentFailedNotification(userId, {
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          error: paymentIntent.last_payment_error?.message
        });
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  },

  async handleSubscriptionCreated(subscription) {
    try {
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata.userId;

      if (userId) {
        await paymentService.updateSubscriptionStatus(
          subscription.id,
          'active'
        );

        await emailService.sendSubscriptionWelcome(userId, {
          subscriptionId: subscription.id,
          planName: subscription.items.data[0].price.nickname
        });
      }
    } catch (error) {
      console.error('Error handling subscription creation:', error);
    }
  },

  async triggerPostPaymentActions(userId, paymentIntent) {
    // Add your custom post-payment logic here
    // Examples:
    // - Activate premium features
    // - Send digital products
    // - Update user permissions
    // - Trigger fulfillment process
    
    console.log(\`Post-payment actions for user \${userId}\`);
  }
};

module.exports = webhookService;`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service" className="mt-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Payment Service</CardTitle>
                <CardDescription className="text-slate-400">src/services/paymentService.js</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="javascript"
                  code={`const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const User = require('../models/User');

const paymentService = {
  async getOrCreateCustomer(userId) {
    let customer = await Customer.findOne({ userId });
    
    if (!customer) {
      const user = await User.findById(userId);
      
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: userId.toString() }
      });

      customer = new Customer({
        userId,
        stripeCustomerId: stripeCustomer.id,
        email: user.email
      });
      
      await customer.save();
    }
    
    return customer;
  },

  async createPaymentRecord(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  },

  async updatePaymentStatus(stripePaymentIntentId, status) {
    return await Payment.findOneAndUpdate(
      { stripePaymentIntentId },
      { 
        status, 
        updatedAt: new Date(),
        ...(status === 'succeeded' && { paidAt: new Date() })
      },
      { new: true }
    );
  },

  async createSubscription(subscriptionData) {
    const subscription = new Subscription(subscriptionData);
    return await subscription.save();
  },

  async updateSubscriptionStatus(stripeSubscriptionId, status) {
    return await Subscription.findOneAndUpdate(
      { stripeSubscriptionId },
      { 
        status, 
        updatedAt: new Date(),
        ...(status === 'canceled' && { canceledAt: new Date() })
      },
      { new: true }
    );
  },

  async getPaymentHistory(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ userId })
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      const refundData = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      // Update payment record
      await Payment.findByIdAndUpdate(payment._id, {
        status: amount && amount < payment.amount ? 'partially_refunded' : 'refunded',
        refundId: refund.id,
        refundedAmount: (refund.amount / 100),
        refundedAt: new Date()
      });

      return refund;
    } catch (error) {
      console.error('Refund creation failed:', error);
      throw error;
    }
  },

  async handleWebhookEvent(event) {
    const webhookService = require('./webhookService');
    return await webhookService.handleWebhookEvent(event);
  }
};

module.exports = paymentService;`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Setup Instructions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Setup Instructions</h2>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">1. Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="bash"
                code={`# Add to your .env file
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: For production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...`}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">2. Install Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="bash"
                code={`npm install stripe
npm install express-raw-body  # For webhook signature verification`}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">3. Configure Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-300">Set up webhooks in your Stripe dashboard:</p>
                <CodeBlock
                  language="text"
                  code={`Webhook URL: https://yourdomain.com/api/payments/webhook

Events to listen for:
- payment_intent.succeeded
- payment_intent.payment_failed
- invoice.payment_succeeded
- invoice.payment_failed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
