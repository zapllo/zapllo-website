import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the Leave Balance
interface ILeaveBalance {
    leaveType: mongoose.Types.ObjectId; // Reference to the leave type
    balance: number; // Remaining balance for this leave type
}

// Define an interface for the User document
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    whatsappNo: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isVerified: boolean;
    isAdmin: boolean;
    role: 'member' | 'manager' | 'orgAdmin';
    reportingManager: mongoose.Types.ObjectId | null;
    organization: mongoose.Types.ObjectId | null;
    notifications: {
        email: boolean;
        whatsapp: boolean;
    };
    isPro: boolean;
    subscribedPlan: string;
    promotionNotification: boolean;
    credits: number;
    leaveBalances: ILeaveBalance[]; // Individual balances for each leave type
    totalLeaveBalance: number; // Total leave balance (sum of all leave types)
    forgotPasswordToken: string | null;
    forgotPasswordTokenExpiry: Date | null;
    verifyToken: string | null;
    verifyTokenExpiry: Date | null;
    checklistProgress: boolean[];
    faceDescriptors: number[][]; // An array of face descriptors (each descriptor is an array of numbers)
    imageUrls: { type: [String], default: [] };
    country: string;
    profilePic: string;
}

// Define the schema
const userSchema: Schema<IUser> = new mongoose.Schema({
    whatsappNo: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, default: 'member' },
    reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations', default: null },
    notifications: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
    },
    isPro: { type: Boolean, default: false },
    subscribedPlan: { type: String, default: '' },
    promotionNotification: { type: Boolean, default: false },
    credits: { type: Number, default: 0 },
    leaveBalances: [
        {
            leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'leaveTypes', required: true },
            balance: { type: Number, required: true }, // Balance for each leave type
        },
    ],
    totalLeaveBalance: {
        type: Number, // Total balance from all leave types
        default: 0,
    },
    forgotPasswordToken: { type: String, default: null },
    forgotPasswordTokenExpiry: { type: Date, default: null },
    verifyToken: { type: String, default: null },
    verifyTokenExpiry: { type: Date, default: null },
    checklistProgress: { type: [Boolean], default: Array(9).fill(false) },
    faceDescriptors: {
        type: [[Number]], // A 2D array to store multiple face descriptors for each user
        default: [],
    },
    imageUrls: {
        type: [String], // Array to store multiple image URLs
        default: [],
    },
    country: {
        type: String,
    },
    profilePic: {
        type: String,
    },
}, { timestamps: true });

// Define and export the User model
const User: Model<IUser> = mongoose.models.users || mongoose.model<IUser>("users", userSchema);
export default User;
