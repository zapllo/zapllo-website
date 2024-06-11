import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true
    },
    industry: {
        type: String,
        required: true
    },
    teamSize: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categories: {
        type: [String],
        required: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    trialExpires: {
        type: Date,
        required: true
    }
});

// Model for organizations
const Organization = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);

export default Organization;