'use client'

import React, { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import axios from 'axios';

interface Task {
    _id: string;
    title: string;
    user: User;
    description: string;
    assignedUser: User;
    category: { _id: string; name: string; }; // Update category type here
    priority: string;
    repeatType: string;
    repeat: boolean;
    days?: string[];
    dates?: string[];
    categories?: string[];
    dueDate: string;
    completionDate: string;
    attachment?: string;
    links?: string[];
    status: string;
    comments: Comment[];
    createdAt: string;
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    organization: string;
    email: string;
    role: string;
}





interface Category {
    _id: string;
    name: string;
}

interface EditTaskDialogProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onTaskUpdate: (task: Task) => void;
    users: User[];
    categories: Category[];
}

interface Comment {
    _id: string;
    userId: string; // Assuming a user ID for the commenter
    userName: string; // Name of the commenter
    comment: string;
    createdAt: string; // Date/time when the comment was added
    status: string;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ open, onClose, task, onTaskUpdate, users, categories }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        category: '',
        assignedUser: '',
        repeat: false,
        repeatType: 'Daily',
        dueDate: '',
        days: [] as string[],
        dates: [] as string[],
        attachment: '',
        links: [] as string[],
        status: 'Pending'
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Medium',
                category: task.category._id || '',
                assignedUser: task.assignedUser._id || '',
                repeat: task.repeat || false,
                repeatType: task.repeatType || 'Daily',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                days: task.days || [],
                dates: task.dates || [],
                attachment: task.attachment || '',
                links: task.links || [],
                status: task.status || 'Pending'
            });
        }
    }, [task]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, type } = e.target;

        if (type === 'checkbox') {
            // Assert that e.target is an HTMLInputElement
            const input = e.target as HTMLInputElement;
            setFormData(prevState => ({
                ...prevState,
                [name]: input.checked // Checkbox elements use 'checked'
            }));
        } else {
            // For other types of elements, use 'value'
            const input = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            setFormData(prevState => ({
                ...prevState,
                [name]: input.value // Other elements use 'value'
            }));
        }
    };



    const handleLinkChange = (index: number, value: string) => {
        const updatedLinks = [...formData.links];
        updatedLinks[index] = value;
        setFormData(prevState => ({
            ...prevState,
            links: updatedLinks
        }));
    };

    const addLink = () => {
        setFormData(prevState => ({
            ...prevState,
            links: [...prevState.links, '']
        }));
    };

    const removeLink = (index: number) => {
        const updatedLinks = formData.links.filter((_, i) => i !== index);
        setFormData(prevState => ({
            ...prevState,
            links: updatedLinks
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.patch('/api/tasks/edit', { id: task?._id, ...formData });
            onTaskUpdate(response.data.data);
            onClose(); // Close the dialog on success
        } catch (error) {
            console.error('Error updating task', error);
        }
    };

    if (!open) return null; // Render nothing if the dialog is not open

    return (
        <div className="fixed inset-0 w-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-black border max-h-screen overflow-y-scroll scrollbar-hide p-6 text-xs rounded-lg max-w-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
                <label className="block mb-2">
                    Title:
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mt-1"
                    />
                </label>
                <label className="block mb-2">
                    Description:
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mt-1"
                        rows={4}
                    />
                </label>
                <div className="grid gap-2 grid-cols-2">
                    <label className="block mb-2">
                        Priority:
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1"
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </label>
                    <label className="block mb-2">
                        Category:
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1"
                        >
                            {categories.map(category => (
                                <option key={category._id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <label className="block mb-2">
                    Assigned User:
                    <select
                        name="assignedUser"
                        value={formData.assignedUser}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mt-1"
                    >
                        {users.map(user => (
                            <option key={user._id} value={user._id}>
                                {user.firstName}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        name="repeat"
                        checked={formData.repeat}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    Repeat
                </label>
                {formData.repeat && (
                    <div className="grid gap-2 grid-cols-2">
                        <label className="block mb-2">
                            Repeat Type:
                            <select
                                name="repeatType"
                                value={formData.repeatType}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1"
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </label>
                        <label className="block mb-2">
                            Due Date:
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </label>
                    </div>
                )}
                <div className="flex flex-col mb-4">
                    <label className="block mb-2">Links:</label>
                    {formData.links.map((link, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="text"
                                value={link}
                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                className="w-full p-2 border rounded mr-2"
                            />
                            <button
                                onClick={() => removeLink(index)}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addLink}
                        className="bg-blue-500 text-white p-2 rounded"
                    >
                        Add Link
                    </button>
                </div>
                <label className="block mb-2">
                    Attachment URL:
                    <input
                        type="text"
                        name="attachment"
                        value={formData.attachment}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mt-1"
                    />
                </label>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white p-2 rounded mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white p-2 rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskDialog;
