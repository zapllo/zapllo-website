import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

type Props = {}

export default function SaveMore2({ }: Props) {
    return (
        <div className='justify-center mt-12   w-full  flex '>
            <div className='grid grid-cols-2 gap-2 max-w-5xl w-full  mt-4 justify-center items-center '>
                <div className='w-full'>
                    <img src="/product/save.png" className='w-[90%] ' />
                </div>
                <div className="w-full">
                    <h1 className="text-3xl whitespace-nowrap font-semibold">
                        Manage your Team in 10 mins a day
                    </h1>
                    <p className="text-sm  text-muted-foreground mt-4">
                        Unlock the Power of AUTOMATE TASKS APP with WhatsApp Reminders & IOX Team Productivity,V
                    </p>
                    <div className="w-[110%] flex gap-4 mt-8 ">
                        <div className="z-10    min-h-[10rem]   items-center ">
                            <div
                                className={cn(
                                    "group rounded-full border border-black/5  transition-all ease-in  text-base text-white  hover:cursor-pointer  dark:border-white/5 dark:hover:text-white dark:bg-gradient-to-r from-[#A587FF] to-[#5E29FF] dark:hover:bg-blue-800",
                                )}
                            >
                                <Link href='/bookdemo'>

                                    <div className="inline-flex text-2xl items-center justify-center px-6 py-2 transition ease-out hover:text-neutral-600 hover:duration-900  hover:dark:text-white">
                                        <span className="flex mt-auto text-xl  font-medium  gap-2">
                                            <div className="m ">

                                            </div>
                                            <h1 className=" text-md">
                                                Join Live Master Classes
                                            </h1>
                                        </span>

                                    </div>
                                </Link>
                            </div>

                        </div>
                        <div className=''>
                            <button className='bg-gradient-to-b text-lg from-[#1C1F3E]  to-[#010313] border px-4 py-2 rounded-3xl text-[#815BF5]'>Create Your Free Account </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}