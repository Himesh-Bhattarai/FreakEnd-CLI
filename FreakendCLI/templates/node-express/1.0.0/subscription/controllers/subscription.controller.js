const subscriptionService = require('../services/subscription.service');

exports.createSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.body);
    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.cancelSubscription(id);
    res.json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};