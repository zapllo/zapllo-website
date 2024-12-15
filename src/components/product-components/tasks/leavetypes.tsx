import React from 'react'
import PayrollFaq from './Faq'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {}

export default function SettingUp3({ }: Props) {
    return (
        <div className='w-full flex -mt-24 max-w-8xl items-center justify-center'>
            <div className=''>
                <div className='grid grid-cols-2  items-center'>
                    <div className='w-full h-[648px] rounded-xl'>
                        <img src='/product/notifications.png' className='rounded-xl object-cover h-full w-full' />
                    </div>
                    <div>
                        <div className=' rounded-xl'>
                            {/* <PayrollFaq /> */}
                            <img src='/product/icons/notifications.png' className='rounded-xl h-20' />
                        </div>
                        <h1 className='text-3xl font-bold mt-4'>Team will receive Notifications</h1>
                        <p className='text-muted-foreground w-full max-w-lg mt-4 text-'>Instant WhatsApp alerts about new tasks on
                        their mobile devices.</p>
                     
                    </div>

                </div>

              
            </div>

        </div>
    )
};