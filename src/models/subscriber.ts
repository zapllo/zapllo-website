import mongoose, { Document, Schema } from 'mongoose';

interface ISubscriber extends Document {
  email: string;
  subscribedAt: Date;
}

// Check if the model has already been defined
const Subscriber = mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>('Subscriber', new mongoose.Schema({
    email: { type: String },
    subscribedAt: { type: Date, default: Date.now }
  }));

export default Subscriber;
