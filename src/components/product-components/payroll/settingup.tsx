import React from 'react'
import PayrollFaq from './Faq'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {}

export default function SettingUp({ }: Props) {
    return (
        <div className='w-full flex max-w-8xl items-center justify-center'>
            <div className=' mt-20 '>
                <div className='flex justify-center   w-full'>
                    <h1 className='text-center  text-2xl font-bold md:max-w-xl'><span className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent '>
                        Setting Up Zapllo Payroll
                    </span> </h1>
                </div>
                <h1 className='font-bold text-center mb-4 text-3xl mt-4'>Get Started in 4 Simple Steps</h1>
                {/**First Setting up */}
                <div className='grid grid-cols-2 items-center'>
                    <div className='w-full h-[648px] rounded-xl'>
                        <img src='/product/addteam.png' className='rounded-xl object-cover h-full w-full' />
                    </div>
                    <div>
                        <div className=' rounded-xl'>
                            {/* <PayrollFaq /> */}
                            <img src='/product/icons/addteam.png' className='rounded-xl h-20' />
                        </div>
                        <h1 className='text-3xl font-bold mt-4'>Add your Team</h1>
                        <p className='text-muted-foreground w-full max-w-lg mt-4 text-'>Start by adding your teammates & assigning their reporting managers. This means all leave and attendance requests go straight to the right people for quick approval or rejection. Smooth, organized, and hassle-free!.</p>
                        
                    </div>

                </div>

              
            </div>

        </div>
    )
};