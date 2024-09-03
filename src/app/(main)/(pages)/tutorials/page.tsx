'use client';

import ChecklistSidebar from '@/components/sidebar/checklistSidebar';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Tutorials() {
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const router = useRouter();
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


    // if (isTrialExpired) {
    //     return (
    //         router.replace('/trial-expired')
    //     );
    // }


    return (
        <div className="flex mt-24">
            <ChecklistSidebar />
            <div className="flex-1 p-4">
                <div className="w-full  min-h-screen  -mt-32 max-w-4xl mx-auto">
                    <div className="gap-2 flex mb-6 w-full">
                        <div className="-mt-2 w-full">

                            <div className='flex justify-center ml-12 mt-24 p-4'>
                                <div className='space-y-2'>
                                    <img src='/animations/loading.gif' className='h-64 ml-24' />
                                    <h1 className='text-2xl text-center ml-12 font-bold'>Coming Soon!</h1>
                                    <p className='ml-6'>We are bringing Tutorials to help you grow your business</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
