import { ShiningButton } from '@/components/globals/shiningbutton'
import { Bell, Home, MessageCircle, MessageCircleReply, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const DashboardPage = () => {
    return (
        <div className='flex flex-col bg-[#04071F] gap-4 relative'>
            <h1 className='text-xl gap-2 sticky top-0 z-[10] p-6 bg-[#04071F] backdrop-blur-lg flex items-center border-b'>   <Home className='h-5' />  Admin Dashboard
            </h1>
            <div className='grid grid-cols-4 gap-4 p-6'>
                <div className='p-4 bg-[#121741] items-center flex justify-center rounded-md '>
                    <div className='text-center font-bold text-xl space-y-4'>
                        <div className='flex justify-center gap-2 mb-4'>
                            <Bell className='h-5 ' />
                            <h1 className='mt-auto'>  Subscribers</h1>
                        </div>
                        <Link href='/adminprivatesecured/subscribers'>
                            <ShiningButton text='Manage Subscribers' />
                        </Link>
                    </div>
                </div>
                <div className='p-4 bg-[#121741] items-center flex justify-center rounded-md '>
                    <div className='text-center font-bold text-xl space-y-4'>
                        <div className='flex justify-center gap-2 mb-4'>
                            <MessageCircleReply className='h-5 ' />
                            <h1 className='mt-auto'>Messages</h1>
                        </div>
                        <Link href='/adminprivatesecured/messages'>
                            <ShiningButton text='View Messages' />
                        </Link>
                    </div>
                </div>
                <div className='p-4 bg-[#121741] items-center flex justify-center rounded-md '>
                    <div className='text-center font-bold text-xl space-y-4'>
                        <div className='flex justify-center gap-2 mb-4'>
                            <Users className='h-5 ' />
                            <h1 className='mt-auto'>  Users</h1>
                        </div>
                        <Link href='/adminprivatesecured/users'>
                            <ShiningButton text='Manage Users' />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage