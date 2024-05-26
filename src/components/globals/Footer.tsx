import React from 'react'
import { Separator } from '../ui/separator'
import ShimmerButton from '../magicui/shimmer-button'
import { BookCall } from '../ui/bookcall'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { BookCall2 } from '../ui/bookdemo'
import { LetsCall } from '../ui/letscall'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className='max-w-full p-4 w-full'>
            <Separator />
            <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
                <div className='Zapllo my-8  p-6'>
                    <img src='logo.png' className='h-6' />
                    <div className='flex gap-3 text-xs mt-6'>
                        <h1>TEMPLATE</h1>
                        <h1>STORIES</h1>
                        <h1>CONTACT</h1>
                    </div>
                    <div className='flex gap-3 mt-6'>
                        <img src="twitter.png" alt="" className='h-8' />
                        <img src="facebook.png" alt="" className='h-8' />
                        <img src="instagram.png" alt="" className='h-8' />
                    </div>
                    <div className='flex gap-6 mt-8'>
                        <ShimmerButton className="shadow-2xl">
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-[#1C1F3E] dark:to-[#010313] lg:text-md">
                                Get Started
                            </span>
                        </ShimmerButton>
                        <LetsCall />

                    </div>
                </div>
                <div className='empty rectangle'>
                    <img src='emptyrec.png' className='h-[90%]' />
                </div>
                <div className=' overflow-hidden my-8 p-6'>
                    <div className='flex gap-8 '>
                        {/* <img src='at.png' className='h-full' /> */}
                        <div className=''>
                            <img src='at.gif' className='bg-gradient-to-r p-3 rounded-2xl from-[#815BF5] via-[#FC8929] to-[#FC8929]   w-full' />
                        </div>
                        <div>
                            <h1 className='text-lg   font-bold'>Subscribe to AI Insider</h1>
                            <p className='text-[#676B93] text-sm mt-2'>Get latest updates on how technology is transforming Businesses and leveraging AI to get 10X results</p>
                        </div>
                        {/* <img src='ellipse.png' className='absolute h- w-48 rounded-full object-cover' /> */}
                    </div>
                    <div className='flex'>
                        <Input placeholder='Enter Your Email' className='mt-6 h-12 rounded-r-none' />
                        <Button className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] p-6 rounded-xl rounded-l-none mt-6 ' >Subscribe</Button>
                    </div>
                </div>
            </div>
            <Separator />
            <div className='md:flex md:justify-between p-6'>
                <div className='md:max-w-[600px]'>
                    <h1 className='text-[#676B93] mt-6 text-xs md:text-sm'>Copyright © 2024 zapllo. All rights reserved.</h1>
                    <p className='text-[#676B93] text-xs mt-4'>This site is not a part of the Facebook website or Facebook Inc. Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.</p>
                </div>
                <div className='flex gap-3'>
                    <Link href='/terms'>
                        <h1 className='text-[#676B93] mt-6 text-xs md:text-sm cursor-pointer hover:text-gray-200'>Terms of Use </h1>
                    </Link>
                    <h1 className='text-[#676B93] mt-6 text-xs md:text-sm'>|</h1>
                    <Link href='/refundpolicy'>
                        <h1 className='text-[#676B93] mt-6 text-xs md:text-sm cursor-pointer hover:text-gray-200'>Refund Policy</h1>
                    </Link>
                </div>
            </div>
        </footer>
    )
}
