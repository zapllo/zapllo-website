import React from 'react'
import { BookCall } from '../ui/bookcall'

export default function OurTeam() {
    return (
        <>
            <div className='text-center md:block hidden mb-32'>
                <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent text-center font-bold text-3xl'>Our Staff</h1>
                <h1 className='text-4xl font-semibold text-center mt-4'>Our Team Members</h1>
                <div className='justify-center flex'>
                    <div className='rounded-full bg-[#0A0D28] mt-4 -ml-12 h-32 w-32'>
                        <img src='/avatar.png' className='' />
                        <h1>Dianne Russell</h1>
                        <h1 className='mt-12 font-bold -ml-24 absolute text-4xl'>We are Human Too.</h1>
                        <p className='absolute mt-24 -ml-48 text-sm w-[500px]'>Automate and Upgrade your Workflow encapsulates the idea of enhancing efficiency by implementing automated processes while simultaneously improving the quality or effectiveness of your workflow.</p>
                        <p className='absolute mt-48 -ml-48 text-sm w-[500px]'>Automate and Upgrade your Workflow encapsulates the idea of enhancing efficiency by implementing automated processes while simultaneously improving the quality or effectiveness of your workflow.</p>
                        <div className='grid absolute mt-72 -ml-48 grid-cols-2 gap-4'>
                            <div className='bg-white rounded-lg text-black px-4 py-2'>🧠 AI Automated Newsletter </div>
                            <div className='bg-white rounded-lg text-black px-4 py-2'>💌 40-60% Open Rate </div>
                            <div className='bg-white rounded-lg text-black px-4 py-2'>👍 Effortless Engagement </div>
                            <div className='bg-white rounded-lg text-black px-4 py-2'>💵 Increase your Revenue </div>
                        </div>
                        <div className='mt-[32%] -ml-10 absolute'>
                            <BookCall />

                        </div>
                    </div>

                </div>
                <div className='flex justify-between w-[900px] '>
                    <div className='rounded-full bg-[#0A0D28] mt-4  h-32 w-32'>
                        <img src='/avatar.png' className='' />
                        <h1>Dianne Russell</h1>
                    </div>
                    <div>
                        <img src='bald.png' className='h-36' />
                        <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] rounded-2xl text-white w-fit px-4 ml-6 text-center font-bold text-lg'>Dianne Russell</h1>

                    </div>
                    {/* <h1>We're Human Too</h1> */}
                </div>
                <div className='flex justify-between mt-8 ml-12 w-[900px] '>
                    <div className='rounded-full bg-[#0A0D28] mt-4 -ml-28  h-32 w-32'>
                        <img src='/avatar.png' className='' />
                        <h1>Dianne Russell</h1>
                    </div>
                    <div className=''>
                        <img src='bald.png' className='h-36' />
                        <h1>Dianne Russell</h1>


                    </div>
                    {/* <h1>We're Human Too</h1> */}
                </div>
                <div className='flex justify-between -ml-96 gap-12'>
                    {/* <h1>We're Human Too</h1> */}
                </div>
            </div>
            <div className='block md:hidden '>
                <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent text-center font-bold text-3xl'>Our Staff</h1>
                <h1 className='text-4xl font-semibold text-center mt-4'>Our Team Members</h1>
                <div className='flex justify-center mt-4'>
                    <div className='grid grid-cols-1 gap-12 text-center'>
                        <div className='rounded-full bg-[#0A0D28] mt-4 ml-8  h-32 w-32'>
                            <img src='/avatar.png' className='' />
                            <h1>Dianne Russell</h1>
                        </div>
                        <div className=''>
                            <img src='bald.png' className='h-36 mt-4' />
                            <h1>Dianne Russell</h1>
                        </div>
                        <div>
                            <img src='bald.png' className='h-36' />
                            <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] rounded-2xl text-white w-fit px-4 ml-6 text-center font-bold text-lg'>Dianne Russell</h1>
                        </div>
                    </div>

                </div>
                <h1 className='mt-12 font-bold text-center text-4xl'>We are Human Too.</h1>
                <p className=' text-center mt-6  text-sm mx-4'>Automate and Upgrade your Workflow encapsulates the idea of enhancing efficiency by implementing automated processes while simultaneously improving the quality or effectiveness of your workflow.</p>
                <p className=' mt-4 text-sm text-center mx-4'>Automate and Upgrade your Workflow encapsulates the idea of enhancing efficiency by implementing automated processes while simultaneously improving the quality or effectiveness of your workflow.</p>
                <div className='flex justify-center'>

                    <div className='grid  mt-6 grid-cols-1 gap-4'>
                        <div className='bg-white flex justify-between  rounded-md font-bold text-black px-12 py-3'>
                            🧠 AI Automated Newsletter
                        </div>
                        <div className='bg-white flex justify-between  rounded-md font-bold text-black px-12 py-3'>💌 40-60% Open Rate </div>
                        <div className='bg-white flex justify-between  rounded-md font-bold text-black px-12 py-3'>👍 Effortless Engagement </div>
                        <div className='bg-white flex justify-between  rounded-md font-bold text-black px-12 py-3'>💵 Increase your Revenue </div>
                        <div className='mt-4'>
                            <BookCall />
                            <h1 className='mt-8 text-center font-bold '>Upgrade Your Engagement</h1>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
