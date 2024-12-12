import React from 'react'
import PayrollFaq from './Faq'

type Props = {}

export default function PayrollFeatures({ }: Props) {
    return (
        <div className='w-full flex justify-center'>
            <div className='mb-16 mt-20 '>
                <div className='flex justify-center'>
                    <h1 className='text-center  text-2xl font-bold md:max-w-xl'><span className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent '>
                        Core Features
                    </span> </h1>
                </div>
                <h1 className='font-bold text-center mb-4 text-2xl mt-4'>Simplify your Leave & Attendance Management</h1>
                <div className='grid grid-cols-2 max-w-5xl gap-4'>
                    <div className='bg-[#0A0D28] rounded-xl'>
                        <PayrollFaq />
                    </div>
                    <div className='bg-[#0A0D28]  relative rounded-xl'>
                        <img src='/product/face.png' className='rounded-xl ' />
                    </div>
                </div>
            </div>

        </div>
    )
};