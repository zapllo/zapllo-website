'use client'
import TasksTab from '@/components/globals/taskstab'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircleIcon } from 'lucide-react';
import TaskModal from '@/components/globals/taskModal';
import axios from 'axios';


interface Task {
    _id: string;
    title: string;
    user: string;
    description: string;
    assignedUser: string;
    categories: string[];
    priority: string;
    repeatType?: string;
    repeat: boolean;
    days?: string[];
    dueDate: string;
    attachment?: string;
    links?: string[];
    status: string;
}
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    organization: string;
}


export default function TaskManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentUser, setCurrentUser] = useState()


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
                <TasksTab tasks={tasks} currentUser={currentUser} />
            </div>
        </div>
    )
}
