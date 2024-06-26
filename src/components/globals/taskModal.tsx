'use client'

import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

interface TaskModalProps {
    closeModal: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ closeModal }) => {
    // State variables for form inputs
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [assignedUser, setAssignedUser] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [priority, setPriority] = useState<string>('');
    const [repeat, setRepeat] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [users, setUsers] = useState<any[]>([]); // State to store users


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users/all');
                const result = await response.json();

                if (response.ok) {
                    setUsers(result.data);
                } else {
                    console.error('Error fetching users:', result.error);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);
    console.log(users, 'hmm')


    // Function to handle form submission
    const handleAssignTask = async () => {
        // Implement your logic to assign the task here
        // Send the form data to the server
        const taskData = {
            title,
            description,
            assignedUser,
            categories: [category],
            priority,
            repeat: repeat !== '',
            dueDate,
        };

        try {
            const response = await fetch('/api/tasks/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Task Assigned:', result);
                closeModal();
            } else {
                console.error('Error assigning task:', result.error);
            }
        } catch (error) {
            console.error('Error assigning task:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-black text-white w-1/2 rounded-lg p-8">
                <h2 className="text-lg font-bold mb-4">Create New Task</h2>
                <form className="text-sm">
                    <div className="mb-4">
                        <Label htmlFor="title" className="block text-white font-semibold">Title</Label>
                        <Input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="description" className="block font-semibold">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2"></Textarea>
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-5">
                        <div className="mb-4">
                            <label htmlFor="assignedUser" className="block font-semibold">Assigned User</label>
                            <select id="assignedUser" value={assignedUser} onChange={(e) => setAssignedUser(e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id} className='text-white'>{user.firstName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="category" className="block font-semibold">Category</label>
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="">Select Category</option>
                                {/* Populate options dynamically */}
                            </select>
                        </div>
                    </div>
                    <div className="mb-4 text-sm">
                        <label className="block font-semibold">Priority</label>
                        <div>
                            <label htmlFor="highPriority" className="inline-flex items-center mr-4">
                                <input type="radio" id="highPriority" value="High" checked={priority === 'High'} onChange={() => setPriority('High')} className="mr-2" />
                                High
                            </label>
                            <label htmlFor="mediumPriority" className="inline-flex items-center mr-4">
                                <input type="radio" id="mediumPriority" value="Medium" checked={priority === 'Medium'} onChange={() => setPriority('Medium')} className="mr-2" />
                                Medium
                            </label>
                            <label htmlFor="lowPriority" className="inline-flex items-center">
                                <input type="radio" id="lowPriority" value="Low" checked={priority === 'Low'} onChange={() => setPriority('Low')} className="mr-2" />
                                Low
                            </label>
                        </div>
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="repeat" className="block font-semibold">Repeat</label>
                            <input type="text" id="repeat" value={repeat} onChange={(e) => setRepeat(e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="dueDate" className="block font-semibold">Due Date</label>
                            <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="button" className="text-sm text-gray-500 mr-4" onClick={closeModal}>Cancel</button>
                        <Button type="button" className="px-4 py-2 rounded" onClick={handleAssignTask}>Assign Task</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskModal;
