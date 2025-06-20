const paymentService = require('../services/payment.service');

exports.processPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, userId } = req.body;
    
    if (!amount || !paymentMethod || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const paymentIntent = await paymentService.createPaymentIntent(
      amount,
      'usd',
      paymentMethod
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const payment = await paymentService.recordPayment(req.body);
    res.json({ payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};