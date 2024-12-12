import React from 'react'

type Props = {}

export default function Benefits({ }: Props) {
    return (
        <div className='justify-center mx-12  flex '>
            <div className='mb-4 mt-20 '>
                <div className='flex justify-center   w-full'>
                    <h1 className='text-center  text-2xl font-bold md:max-w-xl'><span className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent '>
                        Best Application
                    </span> </h1>
                </div>
                <h1 className='font-bold text-center mb-4 text-2xl mt-4'>
                    Benefits Of Using Leave & Attendance Tracker App
                </h1>
                <div className='flex justify-center items-center  w-full max-w-8xl '>
                    <div className='grid grid-cols-1 gap-4 items-center justify-center'>
                        <div className=''>
                            <img src='/product/icons/calendar.png' className='h-12' />
                            <p className='max-w- w-full'>Attendance can be marked from anywhere, any device</p>
                        </div>
                        <div className=''>
                            <img src='/product/icons/calendar.png' className='h-12' />
                            <p className='max-w- w-full'>Attendance can be marked from anywhere, any device</p>
                        </div>
                        <div className=''>
                            <img src='/product/icons/calendar.png' className='h-12' />
                            <p className='max-w- w-full'>Attendance can be marked from anywhere, any device</p>
                        </div>
                    </div>
                    <div className='w-full h-[514.56px] rounded-xl'>
                        <img src='/product/benefits.png' className='rounded-xl object-cover h-full w-full' />
                    </div>
                    <div className='grid grid-cols-1 gap-4'>
                        <div className=''>
                            <img src='/product/icons/calendar.png' className='h-12' />
                            <p className='max-w- w-full'>Attendance can be marked from anywhere, any device</p>
                        </div>
                        <div className=''>
                            <img src='/product/icons/calendar.png' className='h-12' />
                            <p className='max-w- w-full'>Attendance can be marked from anywhere, any device</p>
                        </div>
                        <div className=''>
                            <img src='/product/icons/calendar.png' className='h-12' />
                            <p className='max-w- w-full'>Attendance can be marked from anywhere, any device</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}