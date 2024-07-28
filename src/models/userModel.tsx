import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
        ref: 'users' // Referencing the Organization model
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations' // Referencing the Organization model
    },
    notifications: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
})

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;

