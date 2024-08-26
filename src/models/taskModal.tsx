import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './userModel';

enum RepeatType {
    Weekly = 'Weekly',
    Monthly = 'Monthly',
    Daily = 'Daily',
}

enum Status {
    Pending = 'Pending',
    Completed = 'Completed',
    InProgress = 'In Progress',
    Reopen = 'Reopen',
}

// Define an interface for the Task document
export interface ITask extends Document {
    title: string;
    user: mongoose.Types.ObjectId;
    description: string;
    assignedUser: IUser | mongoose.Types.ObjectId; // Adjusted for type assertion
    category?: mongoose.Types.ObjectId;
    priority: 'High' | 'Medium' | 'Low';
    repeatType?: RepeatType;
    repeat: boolean;
    days?: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>;
    dates?: number[]; // Assuming dates are numbers 1-31 for monthly
    dueDate: Date;
    completionDate: Date;
    attachment?: string[];
    links?: string[];
    status: 'Pending' | 'In Progress' | 'Completed' | 'Reopen';
    organization: mongoose.Types.ObjectId;
    comments: {
        userName: string;
        comment: string;
        createdAt?: Date;
    }[];
    reminder: {
        email?: {
            type: 'minutes' | 'hours' | 'days' | 'specific'; // Added 'specific'
            value?: number;
            date?: Date; // Added for specific reminders
            sent: boolean;
        } | null;
        whatsapp?: {
            type: 'minutes' | 'hours' | 'days' | 'specific'; // Added 'specific'
            value?: number;
            date?: Date; // Added for specific reminders
            sent: boolean;
        } | null;
    } | null;

}


// Define the schema
const taskSchema: Schema<ITask> = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Assuming referencing the User model
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    assignedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Assuming referencing the User model
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories', // Reference to the Category model
    },
    priority: {
        type: String,
        required: true,
        enum: ['High', 'Medium', 'Low'],
    },
    repeatType: {
        type: String,
        enum: Object.values(RepeatType), // Use enum values to ensure type safety
    },
    repeat: {
        type: Boolean,
        default: false,
    },
    days: {
        type: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        }],
        validate: {
            validator: function (days: string[]) {
                return (this as ITask).repeatType === RepeatType.Weekly ? days.length > 0 : true;
            },
            message: 'Days must be provided for weekly repeat type',
        },
    },
    dates: {
        type: [Number],
        validate: {
            validator: function (dates: number[]) {
                return (this as ITask).repeatType === RepeatType.Monthly ? dates.length > 0 : true;
            },
            message: 'Dates must be provided for monthly repeat type',
        },
    },
    dueDate: {
        type: Date,
        required: true,
    },
    completionDate: {
        type: Date,
    },
    attachment: {
        type: [String],
    },
    links: {
        type: [String],
    },
    status: {
        type: String,
        enum: Object.values(Status), // Use enum values to ensure type safety
        default: 'Pending'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization', // Assuming referencing the Organization model
        required: true,
    },
    reminder: {
        email: {
            type: {
                type: String,
                enum: ['minutes', 'hours', 'days', 'specific'],
            },
            value: {
                type: Number,
                required: function (this: any) {
                    return this.email?.type !== 'specific';
                },
            },
            date: {
                type: Date,
                required: function (this: any) {
                    return this.email?.type === 'specific';
                },
            },
            sent: {
                type: Boolean,
                default: false,
            },
        },
        whatsapp: {
            type: {
                type: String,
                enum: ['minutes', 'hours', 'days', 'specific'],
            },
            value: {
                type: Number,
                required: function (this: any) {
                    return this.whatsapp?.type !== 'specific';
                },
            },
            date: {
                type: Date,
                required: function (this: any) {
                    return this.whatsapp?.type === 'specific';
                },
            },
            sent: {
                type: Boolean,
                default: false,
            },
        },
    },
    comments: [{
        userName: {
            type: String,
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],

}, {
    timestamps: true,
});

// Pre-save middleware to remove repeatType if repeat is false
taskSchema.pre<ITask>('save', function (next) {
    if (!this.repeat) {
        this.repeatType = undefined;
    }
    next();
});

// Define and export the Task model
const Task: Model<ITask> = mongoose.models.tasks || mongoose.model<ITask>('tasks', taskSchema);
export default Task;
