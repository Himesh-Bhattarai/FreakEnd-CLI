import Subscription from '../models/subscription.model.js';
import webpush from 'web-push';
import { validateSubscription, validatePushPayload } from '../utils/validate.js';

export const subscribe = async (req, res) => {
  const userId = req.user.id;
  const sub = req.body;

  if (!validateSubscription(sub)) {
    return res.status(400).json({ message: 'Invalid subscription data' });
  }

  try {
    await Subscription.findOneAndUpdate(
      { userId, endpoint: sub.endpoint },
      { ...sub, userId },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error subscribing', error: err.message });
  }
};

export const unsubscribe = async (req, res) => {
  const userId = req.user.id;
  const { endpoint } = req.body;

  if (!endpoint) return res.status(400).json({ message: 'Endpoint required' });

  try {
    await Subscription.deleteOne({ userId, endpoint });
    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error unsubscribing', error: err.message });
  }
};

export const sendPush = async (req, res) => {
  const { title, body, userIds } = req.body;

  if (!validatePushPayload({ title, body })) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    const query = userIds && userIds.length > 0 ? { userId: { $in: userIds } } : {};
    const subs = await Subscription.find(query);

    const payload = JSON.stringify({ title, body });

    const results = await Promise.allSettled(
      subs.map(sub => webpush.sendNotification(sub, payload))
    );

    res.status(200).json({ message: 'Notifications sent', results });
  } catch (err) {
    res.status(500).json({ message: 'Push failed', error: err.message });
  }
};
