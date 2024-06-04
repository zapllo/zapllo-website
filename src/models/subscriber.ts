import mongoose, { Document, Model, Schema } from "mongoose";

interface ISubscriber extends Document {
  email: string;
}

const SubscriberSchema: Schema<ISubscriber> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber || mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);

export default Subscriber;
