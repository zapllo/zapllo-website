import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true
    },
    industry: {
        type: String,
        required: true,
        enum: ['Retail', 'Technology', 'Healthcare', 'Finance', 'Education', 'Other'] // Add more options as needed
    },
    teamSize: {
        type: String,
        required: true,
        enum: ['1-5', '5-10', '10-20', '20-50', '20-60+'] // Adjust ranges as needed
    },
    description: {
        type: String,
        required: true
    },
    categories: {
        type: String,
        required: true,
        enum: ['Sales', 'Marketing', 'Operations', 'Admin', 'HR', 'Automation', 'General'], // Adjust ranges as needed
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