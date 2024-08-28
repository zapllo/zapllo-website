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
    audioUrl?: string;
    dates?: string[];
    categories?: string[];
    dueDate: string;
    completionDate: string;
    attachment?: string[];
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
        attachment: [] as string[],
        links: [] as string[],
        status: 'Pending'
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Medium',
                category: task.category?._id || '',
                assignedUser: task.assignedUser._id || '',
                repeat: task.repeat || false,
                repeatType: task.repeatType || 'Daily',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                days: task.days || [],
                dates: task.dates || [],
                attachment: task.attachment || [],
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
            <div className="bg-[#1A1C20] border max-h-screen overflow-y-scroll scrollbar-hide p-6 text-xs rounded-lg max-w-screen w-1/2 shadow-lg">
                <div className='flex w-full justify-between'>
                    <h2 className="text-sm font-semibold mb-4">Edit Task</h2>
                    <h1 className='cursor-pointer' onClick={onClose}>X</h1>
                </div>
                <label className="block mb-2">
                    Title:
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border bg-transparent outline-none rounded mt-1"
                    />
                </label>
                <label className="block mb-2">
                    Description:
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-transparent outline-none p-2 border rounded mt-1"
                        rows={4}
                    />
                </label>
                <div className="grid gap-2 grid-cols-2">
                    <div className='flex justify-between gap-2 w-full'>
                        <div className='w-full'>
                            <label className="block mb-2">
                                Assigned User:
                                <select
                                    name="assignedUser"
                                    value={formData.assignedUser}
                                    onChange={handleChange}
                                    className="w-1/2 ml-2 outline-none p-2 border rounded mt-1"
                                >
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>



                    </div>

                    <div className='p-2 h-12 mt-1 rounded-lg flex gap-2 ml-auto'>
                        <h1 className='mt-2'>Category:</h1>

                        <label className="block mb-2 ">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-t outline-none p-2 border rounded "
                            >
                                {categories.map(category => (
                                    <option key={category._id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className='w-full flex justify-between'>
                    <div className="block mb-2">
                        <div className="flex gap-2   w-full rounded-lg mt-1">
                            <h1 className='text-xs mt-2' >Priority:</h1>

                            <div className='mt-2'>
                                {['High', 'Medium', 'Low'].map((level) => (
                                    <label
                                        key={level}
                                        className={`px-4 py-2 text-xs border border-[#505356] font-semibold cursor-pointer ${formData.priority === level
                                            ? 'bg-[#017A5B] text-white'
                                            : 'bg-[#282D32] text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={level}
                                            checked={formData.priority === level}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        {level}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <label className="flex mt-2 items-center mb-4">
                        <input
                            type="checkbox"
                            name="repeat"
                            checked={formData.repeat}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        Repeat
                    </label>
                </div>
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
                        onClick={handleSubmit}
                        className="bg-[#017A5B]  w-full text-white p-2 rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskDialog;
