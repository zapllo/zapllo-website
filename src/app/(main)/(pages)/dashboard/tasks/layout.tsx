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
    const [isTaskLocked, setIsTaskLocked] = useState<boolean | undefined>(undefined);
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
                const isTrialExpired = trialStatusResponse.data.isExpired ||
                    (organization.trialExpires && new Date(organization.trialExpires) <= new Date());
                const isSubscriptionValid = organization.subscriptionExpires &&
                    new Date(organization.subscriptionExpires) > new Date();
                const isAllowedPlan = ['Zapllo Tasks', 'Money Saver Bundle'].includes(organization.subscribedPlan);

                setIsTaskAccess(user.isTaskAccess);
                setIsTrialExpired(isTrialExpired);

                // Redirect logic: Trial is expired, task access is not allowed, or plan is not suitable and subscription is not valid
                if (
                    !user.isTaskAccess ||
                    (isTrialExpired && !isSubscriptionValid) ||
                    (!isAllowedPlan && !isSubscriptionValid)
                ) {
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Error fetching user details or trial status:', error);
            }
        };

        getUserAndTrialStatus();
    }, [router]);




    return (
        <div className='w-full overflow-hidden h-screen'>
            {props.children}
        </div>
    );
};

export default Layout;
