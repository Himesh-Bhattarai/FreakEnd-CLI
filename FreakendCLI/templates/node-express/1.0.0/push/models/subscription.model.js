import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint: { type: String, required: true },
  keys: {
    auth: String,
    p256dh: String,
  },
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);
