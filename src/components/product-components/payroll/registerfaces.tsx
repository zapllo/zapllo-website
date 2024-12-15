import React from 'react'
import PayrollFaq from './Faq'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {}

export default function SettingUp2({ }: Props) {
    return (
        <div className='flex justify-center mx-20 -mt-24'>
            <div className='mb-16 mt-4 '>

                <div className='grid grid-cols-2  w-full max-w-7xl  items-center'>

                    <div>
                        <div className=' rounded-xl'>
                            {/* <PayrollFaq /> */}
                            <img src='/product/icons/faceicon.png' className='rounded-xl h-20' />
                        </div>
                        <h1 className='text-3xl font-bold mt-4'>Register Faces for Attendance App</h1>
                        <p className='text-muted-foreground w-full max-w-lg mt-4 '>Next, have your team register their faces on the app. Our cutting edge facial recognition feature uses your camera to handle logins and logouts. No more fuss with manual check-ins, just smile for the camera, and your attendance is recorded instantly!</p>

                    </div>
                    <div className='w-full h-[648px] rounded-xl'>
                        <img src='/product/register.png' className='rounded-xl object-cover h-full w-full' />
                    </div>
                </div>
            </div>
        </div>
    )
};