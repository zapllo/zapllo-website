import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referencing the Organization model 
    },
    description: {
        type: String,
        required: true,
    },
    assignedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referencing the Organization model 
    },
    categories: {
        type: [String],
    },
    priority: {
        type: String,
        required: true,
        enum: ['High', 'Medium', 'Low'],
    },
    repeatType: {
        type: String,
        enum: ['Weekly', 'Monthly', 'Daily'],
    },
    repeat: {
        type: Boolean,
        default: false,
    },
    days: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    dueDate: {
        type: Date,
        required: true,
    },
    attachment: {
        type: String,
    },
    links: {
        type: [String],
    },
    // reminder: {

    // },
})

const Task = mongoose.models.tasks || mongoose.model("tasks", taskSchema);

export default Task;

