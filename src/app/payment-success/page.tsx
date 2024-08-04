'use client'

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { RocketIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PaymentSuccess = () => {
    const router = useRouter();

    const handleBackToTasks = () => {
        router.push('/dashboard/tasks');
    };

    return (
        <div className="px-24 py-8 bg-[#201024]  " >
            <div className='  rounded-xl rounded-b-none py-2  text-center bg-[#007A5A] '>
                <div className='flex gap-4 w-full justify-center'>
                    <RocketIcon className='h-10 scale-150' /> <h1 className='font-bold text-3xl'>Congratulations, Your Subscription is Active!  </h1>
                </div>

                <div className='flex justify-center bg-[#201024] h-screen w-full '>
                    <Card className='w-fit h-fit bg-transparent p-12 mt-24 '>
                        <CardTitle className='text-xl font-bold'>Payment Successful!</CardTitle>
                        <p className='p-4'>Your payment has been successfully processed and your credits have been updated.</p>
                        <Button className='bg-[#007A5A] hover:bg-[#007A5A] mt-4' onClick={handleBackToTasks}>Back to Dashboard</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
