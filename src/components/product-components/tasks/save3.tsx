import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

type Props = {}

export default function SaveMore3({ }: Props) {
    return (
        <div className='justify-center mx-20  flex '>
            <div className='grid grid-cols-2   mt-4 justify-center items-center '>
                <div className='w-full'>
                    <img src="/product/save.png" className='w-[487px] ' />
                </div>
                <div className="max-w-3xl w-full">
                    <h1 className="text-3xl font-semibold">
                        Start saving money and start investing in growth
                    </h1>
                    <p className="text-sm max-w-lg text-muted-foreground mt-4">
                        Unlock the Power of TASK DELEGATION APP with WhatsApp Reminders & 10X your Team&apos;s Productivity🚀
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
                                            <h1 className=" text-sm">
                                                Join Live Master Classes
                                            </h1>
                                        </span>

                                    </div>
                                </Link>
                            </div>

                        </div>
                        <div className=''>
                            <Link href='/signup'>
                                <button className='bg-gradient-to-b text-sm from-[#1C1F3E]  to-[#010313] border px-4 py-2 rounded-3xl text-[#815BF5]'>Create Your Free Account </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}