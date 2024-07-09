import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
  },
  industry: {
    type: String,
    required: true,
    enum: [
      "Retail",
      "Technology",
      "Healthcare",
      "Finance",
      "Education",
      "Other",
    ], // Add more options as needed
  },
  teamSize: {
    type: String,
    required: true,
    enum: ["1-50", "51-100", "10-20", "101-500", "501-1000", "1000+"], // Adjust ranges as needed
  },
  description: {
    type: String,
    required: true,
  },
  categories: {
    type: String,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  trialExpires: {
    type: Date,
    required: true,
  },
  
});

// Model for organizations
const Organization =
  mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);

export default Organization;
