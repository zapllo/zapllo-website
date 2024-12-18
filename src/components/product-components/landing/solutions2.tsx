import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {}

export default function Solutions2({ }: Props) {
    return (
        <div className='flex justify-center mx-20 -mt-24'>
            <div className='mb-16 mt-4 '>

            <div className='grid grid-cols-2 mx-12 gap-4 items-center'>
                    
                    <div>
                        <div className=' rounded-xl flex items-center gap-4'>
                            {/* <PayrollFaq /> */}
                            <img src='/landing/icons/02.png' className='rounded-xl h-16' />
                            <h1 className='text-3xl font-bold bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent'>Zapllo Payroll</h1>
                        </div>
                        <div className='text-[#676B93] text-sm'>
                            <h1 className='font-bold text-2xl mt-4 mb-4 text-white'>Leave & Attendance Tracker</h1>
                            <h1 className='mt-4' >
                            All-in-One Client Management Solution</h1>
                            <h1 className='mt-4' >
                            Manage all your contacts, leads and products from one place.</h1>
                            <h1 className='mt-4' >
                            Get a clear glance of upcoming follow-ups and lead statuses from dashboard.</h1>
                            <h1 className='mt-4' >
                            Organise your leads using pipelines and manage the stages of each lead.</h1>
                        </div>
                    </div>
                    <div className='mb-4  rounded-xl'>
                        <img src='/landing/mockup2.png' className='rounded-xl object-cover scale-75 ' />
                    </div>
                </div>
            </div>
        </div>
    )
};