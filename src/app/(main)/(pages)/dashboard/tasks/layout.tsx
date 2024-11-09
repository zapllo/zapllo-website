'use client'

import TaskModal from '@/components/globals/taskModal';
import { motion, AnimatePresence } from 'framer-motion';
import InfoBar from '@/components/infobar';
// import MenuOptions from '@/components/sidebar'
import TaskOptions from '@/components/taskbar';
import { PlusCircle, PlusCircleIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const [isTaskAccess, setIsTaskAccess] = useState<boolean | undefined>(undefined);
    const router = useRouter();

    useEffect(() => {
        const getUserAndTrialStatus = async () => {
            try {
                const [userResponse, organizationResponse, trialStatusResponse] = await Promise.all([
                    axios.get('/api/users/me'),
                    axios.get('/api/organization/getById'),
                    axios.get('/api/organization/trial-status')
                ]);

                const user = userResponse.data.data;
                const organization = organizationResponse.data.data;
                const isExpired = trialStatusResponse.data.isExpired || (organization.trialExpires && new Date(organization.trialExpires) <= new Date());

                setIsTaskAccess(user.isTaskAccess);
                setIsTrialExpired(isExpired);

                // Redirect if trial has expired or user lacks task access
                if (!user.isTaskAccess || isExpired) {
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Error fetching user details or trial status:', error);
            }
        };

        getUserAndTrialStatus();
    }, [router]);

    // Conditionally render content if trial has expired
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
        <div className='w-full overflow-hidden h-screen'>
            {props.children}
        </div>
    );
};

export default Layout;
