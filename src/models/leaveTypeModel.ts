import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the types for leave type and paid/unpaid options
enum LeaveType {
    Paid = 'Paid',
    Unpaid = 'Unpaid',
}

enum LeaveUnit {
    FullDay = 'Full Day',
    HalfDay = 'Half Day',
    ShortLeave = 'Short Leave',
}

// Define the interface for the Leave document
export interface ILeaveType extends Document {
    leaveType: string; // Type of leave (e.g., Sick Leave, Casual Leave, etc.)
    description: string; // Description of the leave type
    allotedLeaves: number; // Number of leaves allotted
    type: LeaveType; // Whether the leave is Paid or Unpaid
    backdatedLeaveDays: number; // Number of backdated leave days allowed
    advanceLeaveDays: number; // Number of advance leave days allowed
    includeHolidays: boolean; // Whether holidays are included in leave calculation
    includeWeekOffs: boolean; // Whether week-offs are included in leave calculation
    unit: LeaveUnit[]; // Array of units for leave (Full Day, Half Day, Short Leave)
    organization: mongoose.Types.ObjectId; // Organization reference (leave is organization-specific)
}

// Define the schema
const leaveTypeSchema: Schema<ILeaveType> = new mongoose.Schema({
    leaveType: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    allotedLeaves: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(LeaveType), // 'Paid' or 'Unpaid'
        required: true,
    },
    backdatedLeaveDays: {
        type: Number,
        default: 0, // Default value if not provided
    },
    advanceLeaveDays: {
        type: Number,
        default: 0, // Default value if not provided
    },
    includeHolidays: {
        type: Boolean,
        default: false, // Default value if not provided
    },
    includeWeekOffs: {
        type: Boolean,
        default: false, // Default value if not provided
    },
    unit: {
        type: [String], // Changed from String to an array of strings
        enum: Object.values(LeaveUnit), // Array of 'Full Day', 'Half Day', 'Short Leave'
        required: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization', // Reference to the Organization model
        required: true,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt timestamps
});

// Define and export the Leave model
const Leave: Model<ILeaveType> = mongoose.models.leaveTypes || mongoose.model<ILeaveType>('leaveTypes', leaveTypeSchema);
export default Leave;
