'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import ChecklistSidebar from '@/components/sidebar/checklistSidebar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti'; // Import confetti

const objectives = [
    '1. Add all your employees as Team members or Managers to that Task app. Go to My Team to manage users.',
    '2. Connect your own WhatsApp number to send notifications & reminders from your company’s number. Raise a ticket for further support on this.',
    '3. Set Daily Reminder Time and Weekly Offs. Go to Settings > General and click on Notifications and Reminder.',
    '4. Enable/Disable WhatsApp and email notifications according to your requirement.',
    '5. Create at least 5 Task Categories. Go to Settings > Categories to manage them.',
    '6. Delegate your first task and update its status. Check your Email and WhatsApp for the notifications.',
    '7. Try the Voice Note feature while assigning a task.',
    '8. Add attachments/photos while assigning a task.',
    '9. Add Task Reminders: Set up reminders to alert you before a task’s deadline.',
    '10. Create Daily/Weekly/Monthly/Periodically/Custom repeating tasks.',
    '11. Attach the image/attachment/voice note while updating the task for more clarity about the task.',
    '12. Reopen the task if the user closes the task without completing it.',
    '13. Analyze team member performance in a single dashboard.',
];

export default function ChecklistPage({ }) {
    const [progress, setProgress] = useState<boolean[]>([]);
    const [userId, setUserId] = useState("");
    const [showConfetti, setShowConfetti] = useState(false); // State for confetti

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const userRes = await axios.get('/api/users/me');
                setUserId(userRes.data.data._id);
            } catch (error) {
                console.error('Error fetching user details or trial status:', error);
            }
        }
        getUserDetails();
    }, []);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await fetch(`/api/get-checklist-progress?userId=${userId}`);
                const data = await res.json();
                setProgress(data.progress);
            } catch (error) {
                console.error('Error fetching checklist progress:', error);
            }
        };

        if (userId) {
            fetchProgress();
        }
    }, [userId]);

    const handleObjectiveChange = async (index: number, isCompleted: boolean) => {
        const updatedProgress = [...progress];
        updatedProgress[index] = isCompleted;

        setProgress(updatedProgress);

        if (isCompleted) {
            setShowConfetti(true); // Show confetti on completion
            setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 3 seconds
        }

        try {
            await axios.patch('/api/update-checklist-progress', {
                userId,
                objectiveIndex: index,
                isCompleted,
            });
        } catch (error) {
            console.error('Error updating checklist progress:', error);
        }
    };

    const calculateProgress = () => {
        if (!progress || progress.length === 0) return 0;
        const completedCount = progress.filter(Boolean).length;
        const progressPercentage = (completedCount / objectives.length) * 100;
        return Math.round(progressPercentage); // Round to the nearest integer
    };

    const [isTrialExpired, setIsTrialExpired] = useState(false);

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const response = await axios.get('/api/organization/getById');
                const organization = response.data.data;
                const isExpired = organization.trialExpires && new Date(organization.trialExpires) <= new Date();
                setIsTrialExpired(isExpired);
            } catch (error) {
                console.error('Error fetching user details or trial status:', error);
            }
        }
        getUserDetails();
    }, []);

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
        <div className="flex mt-24 ">
            <ChecklistSidebar />
            <div className="flex-1 p-4">
                <div className="ml-48 border-l  scrollbar-   -mt-32 max-w-8xl mx-auto">
                    <div className="gap-2 flex mb-6 w-full">
                        <div className="-mt-2 h-[600px]  overflow-y-scroll scrollbar-hide  w-full">
                            <div className="p-4 w-full ">
                                {showConfetti &&
                                    <div className=''>
                                        <Confetti />
                                    </div>
                                } {/* Render confetti if needed */}
                                <div className='border border-[#E0E0E066] mt-20  rounded p-4 w-full'>
                                    <h1 className="text-font-bold mb-4">Checklist Progress</h1>
                                    <Progress value={calculateProgress()} className='mb-4' />
                                </div>
                                <div className="space-y-2 mt-4  mb-12   text-center">
                                    {objectives.map((objective, index) => (
                                        <div key={index} className="flex items-center text-xs border p-2 space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`objective-${index}`}
                                                checked={progress[index] || false}
                                                onChange={() => handleObjectiveChange(index, !progress[index])}
                                                className="form-checkbox cursor-pointer h-4 w-4 text-blue-500"
                                            />
                                            <label
                                                htmlFor={`objective-${index}`}
                                                className={` ${progress[index] ? 'line-through text-gray-500' : 'text-white -800'}`}
                                            >
                                                {objective}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
