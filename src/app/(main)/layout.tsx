'use client'

import InfoBar from '@/components/infobar'
import MenuOptions from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { XIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {
    const [trialExpires, setTrialExpires] = useState<Date | null>(null);
    const [remainingTime, setRemainingTime] = useState('');


    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        // Reset visibility on route change
        setIsVisible(true);
    }, []);

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                // Fetch trial status
                const response = await axios.get('/api/organization/getById');
                console.log(response.data.data); // Log the organization data

                const organization = response.data.data;

                const isExpired = organization.trialExpires && new Date(organization.trialExpires) <= new Date();
                console.log('isExpired:', isExpired);
                console.log('trialExpires:', organization.trialExpires);

                setTrialExpires(isExpired ? null : organization.trialExpires);
            } catch (error) {
                console.error('Error fetching user details or trial status:', error);
            }
        }
        getUserDetails();
    }, []);

    useEffect(() => {
        if (trialExpires) {
            // Calculate remaining time
            const calculateRemainingTime = () => {
                const now = new Date();
                const distance = formatDistanceToNow(new Date(trialExpires), { addSuffix: true });
                setRemainingTime(distance);
            };

            calculateRemainingTime();
            const intervalId = setInterval(calculateRemainingTime, 1000 * 60); // Update every minute

            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [trialExpires]);

    return (
        <div>
            <>
                {isVisible && (
                    <div className='p-2 flex fixed mt- m  top-0  w-[100%] justify-center gap-2 bg-[#75517B] border'>
                        <div className='flex gap-2 justify-center w-full'>
                            <h1 className='text-center mt-1 flex text-white text-xs'>
                                Your Trial Period will expire{' '}<strong className='text-yellow-500'>{remainingTime}</strong>{' '}, upgrade now for uninterrupted access
                            </h1>
                            <Link href='/dashboard/billing' >
                                <Button className='h-5 rounded dark:bg-[#822b90] w-fit px-2 py-3  text-xs text-white'>
                                    Upgrade Now
                                </Button>
                            </Link>
                        </div>

                        <button onClick={handleClose} className='ml-auto text-white'>
                            <XIcon className='h-4 w-4' />
                        </button>
                    </div>
                )}
            </>
            <div className={`flex overflow-hidden ${isVisible ? 'mt-10' : ''}  dark:bg-[#201124] scrollbar-hide h-full w-full `}>

                <MenuOptions />
                <div className='w-full overflow-hidden please h-screen '>
                    <InfoBar />
                    <div className=' ml-16 '>
                        {props.children}

                    </div>

                </div>
            </div>
        </div>
    )
}

export default Layout