import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the User document
export interface IUser extends Document {
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
    forgotPasswordToken: string | null;
    forgotPasswordTokenExpiry: Date | null;
    verifyToken: string | null;
    verifyTokenExpiry: Date | null;
    checklistProgress: boolean[];
}

// Define the schema
const userSchema: Schema<IUser> = new mongoose.Schema({
    whatsappNo: {
        type: String,
        required: [true, "Please provide whatsappNo"],
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: 'member', //member, manager, orgAdmin
    },
    reportingManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Referencing the User model
        default: null,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations', // Referencing the Organization model
        default: null,
    },
    notifications: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
    },
    isPro: {
        type: Boolean,
        default: false,
    },
    subscribedPlan: {
        type: String,
        default: '', // This will store the name of the subscribed plan
    },
    promotionNotification: {
        type: Boolean,
        default: false,
    },
    credits: {
        type: Number,
        default: 0, // Set default value to 0 or any other initial amount
    },
    forgotPasswordToken: {
        type: String,
        default: null,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
        default: null,
    },
    verifyToken: {
        type: String,
        default: null,
    },
    verifyTokenExpiry: {
        type: Date,
        default: null,
    },
    checklistProgress: {
        type: [Boolean],
        default: Array(9).fill(false), // 9 objectives, all false initially
    },
}, { timestamps: true });

// Define and export the User model
const User: Model<IUser> = mongoose.models.users || mongoose.model<IUser>("users", userSchema);
export default User;
