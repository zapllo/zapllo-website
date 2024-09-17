import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginEntry extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'login' | 'logout'; // Added to track action type
  lat: number;
  lng: number;
  timestamp: Date;
}

const loginEntrySchema: Schema<ILoginEntry> = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['login', 'logout'], required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const LoginEntry = mongoose.models.LoginEntry || mongoose.model<ILoginEntry>('LoginEntry', loginEntrySchema);
export default LoginEntry;
