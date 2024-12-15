import React from 'react'
import PayrollFaq from './Faq'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {}

export default function SettingUp3({ }: Props) {
    return (
        <div className='w-full flex -mt-24 max-w-8xl items-center justify-center'>
            <div className=''>
                <div className='grid grid-cols-2 items-center'>
                    <div className='w-full h-[648px] rounded-xl'>
                        <img src='/product/leavetypes.png' className='rounded-xl object-cover h-full w-full' />
                    </div>
                    <div>
                        <div className=' rounded-xl'>
                            {/* <PayrollFaq /> */}
                            <img src='/product/icons/leavetype.png' className='rounded-xl h-20' />
                        </div>
                        <h1 className='text-3xl font-bold mt-4'>Define Leave Types</h1>
                        <p className='text-muted-foreground w-full max-w-lg mt-4 '>Customize your leave policies effortlessly. Define leave types such as casual, sick, or maternity leave. Decide on the total number of allotted leaves, whether they are paid or unpaid, and set durations from full days to short breaks.</p>
                      
                    </div>

                </div>

              
            </div>

        </div>
    )
};