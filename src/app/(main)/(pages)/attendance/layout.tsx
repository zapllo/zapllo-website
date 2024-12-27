'use client'

import LeavesSidebar from '@/components/sidebar/leavesSidebar';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const [isLeaveAccess, setIsLeaveAccess] = useState();
    const router = useRouter();

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const [userResponse, organizationResponse] = await Promise.all([
                    axios.get('/api/users/me'),
                    axios.get('/api/organization/getById')
                ]);

                const user = userResponse.data.data;
                const organization = organizationResponse.data.data;

                setIsLeaveAccess(user.isLeaveAccess);

                const isExpired = organization.attendanceTrialExpires && new Date(organization.attendanceTrialExpires) <= new Date();
                setIsTrialExpired(isExpired);
                const isAllowedPlan = ['Money Saver Bundle'].includes(organization.subscribedPlan);
                const isSubscriptionValid = organization.subscriptionExpires &&
                    new Date(organization.subscriptionExpires) > new Date();

                if (
                    !user.isLeaveAccess ||
                    (isTrialExpired && !isSubscriptionValid) ||
                    (!isAllowedPlan && !isSubscriptionValid)
                ) {
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Error fetching user details or trial status:', error);
            }
        };
        getUserDetails();
    }, [router]);

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



    return (
        <div className={`flex overflow-hidden  dark:bg-[#04061e] scrollbar-hide h-full w-full `}>
            <LeavesSidebar />
            <div className='w-full overflow-hidden please h-screen '>
                <div className='  mt-12 ml-48 '>
                    {props.children}
                </div>
            </div>
        </div>

    )
}

export default Layout