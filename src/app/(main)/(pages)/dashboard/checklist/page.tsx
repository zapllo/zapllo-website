'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import ChecklistSidebar from '@/components/sidebar/checklistSidebar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';



const objectives = [
    '1. Complete the task description here',
    '2. Complete the task description here',
    '3. Complete the task description here',
    '4. Complete the task description here',
    '5. Complete the task description here',
    '6. Complete the task description here',
    '7. Complete the task description here',
    '8. Complete the task description here',
    '9. Complete the task description here',
];

export default function ChecklistPage({ }) {
    const [progress, setProgress] = useState<boolean[]>([]);
    const [userId, setUserId] = useState("");

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
        const progressPercentage = (completedCount / progress.length) * 100;
        return Math.round(progressPercentage); // Round to the nearest integer
    };
    const [isTrialExpired, setIsTrialExpired] = useState(false);

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                // Fetch trial status
                const response = await axios.get('/api/organization/getById');
                console.log(response.data.data); // Log the organization data
                const organization = response.data.data;
                // Check if the trial has expired
                const isExpired = organization.trialExpires && new Date(organization.trialExpires) <= new Date();
                console.log('isExpired:', isExpired);
                console.log('trialExpires:', organization.trialExpires);

                setIsTrialExpired(isExpired); // Set to true if expired, false otherwise
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
        <div className="flex mt-24">
            <ChecklistSidebar />
            <div className="flex-1 p-4">
                <div className=" ml-48  border-l -mt-32   max-w-8xl mx-auto">
                    <div className="gap-2 flex mb-6  w-full">
                        <div className="-mt-2 w-full">
                            <div className="p-4 w-full">
                                <div className='border border-[#E0E0E066] mt-20 rounded p-4 w-full'>
                                    <h1 className="text- font-bold mb-4">Checklist Progress</h1>
                                    <Progress value={calculateProgress()} className='mb-4' />
                                </div>


                                <div className="space-y-2 mt-4 text-center ">
                                    {objectives.map((objective, index) => (
                                        <div key={index} className="flex items-center  border p-2 space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`objective-${index}`}
                                                checked={progress[index] || false}
                                                onChange={() => handleObjectiveChange(index, !progress[index])}
                                                className="form-checkbox h-4 w-4 text-blue-500"
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
