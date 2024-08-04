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
    enum: ["1-5", "5-10", "10-15", "15-20", "20-25", "25+"], // Adjust ranges as needed
  },
  description: {
    type: String,
    required: true,
  },
  categories:
    [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
      },
    ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],

  trialExpires: {
    type: Date,
    required: true,
  },

});

// Model for organizations
const Organization =
  mongoose.models.organizations ||
  mongoose.model("organizations", organizationSchema);

export default Organization;
