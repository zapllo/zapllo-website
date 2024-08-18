'use client'
import TasksTab from '@/components/globals/taskstab'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PlusCircleIcon } from 'lucide-react';
import TaskModal from '@/components/globals/taskModal';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from "js-cookie";


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
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if the user is already logged in
        const token = Cookies.get("token");
        if (!token) {
            router.replace("/login");
        }
    }, [router]);


    useEffect(() => {
        const getUserDetails = async () => {
            const res = await axios.get('/api/users/me')
            setCurrentUser(res.data.data);
            const trialStatusRes = await axios.get('/api/organization/trial-status');
            setIsTrialExpired(trialStatusRes.data.isExpired);
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
                console.log(result.data, 'logging')
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


    const handleTaskUpdate = (updatedTask: any) => {
        fetchTasks();

    };

    if (isTrialExpired) {
        return (
            <div className='p-4 text-center mt-32'>
                <h1 className='text-xl font-bold text-red-500'>Your trial has expired!</h1>
                <p>Please purchase a subscription to continue using the Task Management features.</p>
                <Link href='/dashboard/billing'>
                    <Button className='h-10 bg-white text-black hover:text-white mt-4 text-lg '>👑 Upgrade to Pro</Button>
                </Link>
            </div>
        );
    }


    return (
        <div className='p-4'>
            {/* <h1 className='text-center text-xl font-bold under'>Task Management</h1> */}
            <div className="fixed bottom-8 right-8 z-50">
                <button className="flex items-center justify-center w-12 h-12 rounded-full bg-[#007A5A] text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50" onClick={openModal}>
                    <Plus size={24} />
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
