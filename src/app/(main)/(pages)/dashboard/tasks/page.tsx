'use client'
import TasksTab from '@/components/globals/taskstab'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircleIcon } from 'lucide-react';
import TaskModal from '@/components/globals/taskModal';
import axios from 'axios';


// Define the Task interface
// interface Task {
//     _id: string;
//     title: string;
//     user: User;
//     description: string;
//     assignedUser: User;
//     category: string;
//     priority: string;
//     repeatType?: string;
//     repeat: boolean;
//     days?: string[];
//     categories?: string[];
//     dueDate: string;
//     attachment?: string;
//     links?: string[];
//     status: string;
//     comments: Comment[];
//     createdAt: string;
// }


interface User {
    _id: string;
    firstName: string;
    lastName: string;
    organization: string;
}


export default function TaskManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [currentUser, setCurrentUser] = useState<any>();


    useEffect(() => {
        const getUserDetails = async () => {
            const res = await axios.get('/api/users/me')
            setCurrentUser(res.data.data);
        }
        getUserDetails();
    }, [])

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        fetchTasks();
    };

    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks/organization');
            const result = await response.json();
            if (response.ok) {
                setTasks(result.data);
            } else {
                console.error('Error fetching tasks:', result.error);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    console.log(tasks, 'tasks from organization')

    const deleteTaskAndUpdateList = async (taskId: string) => {
        try {
            await axios.delete('/api/tasks/delete', {
                data: { id: taskId },
            });
            // Update tasks list after deletion
            fetchTasks();
        } catch (error: any) {
            console.error('Error deleting task:', error.message);
            // Handle error as needed
        }
    };


    const handleTaskUpdate = () => {
        fetchTasks();
    };

    return (
        <div className='p-4'>
            <h1 className='text-center text-xl font-bold under'>Task Management</h1>
            <div className="fixed bottom-8 right-8 z-50">
                <button className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={openModal}>
                    <PlusCircleIcon size={24} />
                </button>
            </div>
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <TaskModal closeModal={closeModal} />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className='p-2'>
                {/* <h1 className='text-center font-bold text-xl p-4'>Teams</h1> */}
                <TasksTab tasks={tasks} currentUser={currentUser} onTaskDelete={deleteTaskAndUpdateList} onTaskUpdate={handleTaskUpdate} />
            </div>
        </div>
    )
}
