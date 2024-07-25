import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditTaskDialog = ({ open, onClose, task, onTaskUpdate, users, categories }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        category: '',
        assignedUser: '',
        repeat: false,
        repeatType: 'Daily',
        dueDate: '',
        days: [],
        dates: [],
        attachment: '',
        links: [],
        status: 'Pending'
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Medium',
                category: task.category || '',
                assignedUser: task.assignedUser || '',
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prevState => ({
                ...prevState,
                [name]: checked
            }));
        } else if (name === 'days' || name === 'dates') {
            const updatedArray = formData[name].includes(value)
                ? formData[name].filter(item => item !== value)
                : [...formData[name], value];
            setFormData(prevState => ({
                ...prevState,
                [name]: updatedArray
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleLinkChange = (index, value) => {
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

    const removeLink = (index) => {
        const updatedLinks = formData.links.filter((_, i) => i !== index);
        setFormData(prevState => ({
            ...prevState,
            links: updatedLinks
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.patch('/api/tasks/edit', { id: task._id, ...formData });
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
                        rows="4"
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
                                {user.firstName} {user.lastName}
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
                    <>
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
                        {formData.repeatType === 'Weekly' && (
                            <div className="block mb-2">
                                <label className="block mb-2">Days:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                        <label key={day} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="days"
                                                value={day}
                                                checked={formData.days.includes(day)}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            {day}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        {formData.repeatType === 'Monthly' && (
                            <div className="block mb-2">
                                <label className="block mb-2">Dates:</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                                        <label key={date} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="dates"
                                                value={date}
                                                checked={formData.dates.includes(date)}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            {date}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block mb-2">
                        Attachment:
                        <input
                            type="text"
                            name="attachment"
                            value={formData.attachment}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1"
                        />
                    </label>
                </div>
                <div className="block mb-4">
                    <label className="block mb-2">Links:</label>
                    {formData.links.map((link, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="text"
                                value={link}
                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                className="w-full p-2 border rounded mr-2"
                            />
                            <button onClick={() => removeLink(index)} className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                        </div>
                    ))}
                    <button onClick={addLink} className="py-2 px-4 bg-primary -500 rounded text-white">Add Link</button>
                </div>
                <label className="block mb-4">
                    Status:
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mt-1"
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Reopen">Reopen</option>
                    </select>
                </label>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 bg- -300 rounded text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="py-2 px-4 bg-primary -500 rounded text-white"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskDialog;
