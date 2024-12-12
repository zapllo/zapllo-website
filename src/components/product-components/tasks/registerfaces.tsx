import React from 'react'
import PayrollFaq from './Faq'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {}

export default function SettingUp2({ }: Props) {
    return (
        <div className='flex justify-center mx-12 -mt-24'>
            <div className='mb-16 mt-4 '>
              
                <div className='grid grid-cols-2  w-full max-w-8xl  items-center'>

                    <div>
                        <div className=' rounded-xl'>
                            {/* <PayrollFaq /> */}
                            <img src='/product/icons/delegate.png' className='rounded-xl h-16' />
                        </div>
                        <h1 className='text-2xl mt-4'>Delegate Tasks to your team</h1>
                        <p className='text-muted-foreground w-full max-w-lg mt-4 text-sm'>Start by adding your teammates & assigning their reporting managers. This means all leave and attendance requests go straight to the right people for quick approval or rejection. Smooth, organized, and hassle-free!.</p>
                       
                    </div>
                    <div className='w-[648px] h-[648px] -ml-24 rounded-xl'>
                        <img src='/product/assign.png' className='rounded-xl object-cover h-full w-full' />
                    </div>
                </div>
            </div>
        </div>
    )
};