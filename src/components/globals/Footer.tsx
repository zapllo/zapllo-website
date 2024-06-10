"use client"

import React, { FormEvent, useRef, useState } from 'react'
import { Separator } from '../ui/separator'
import ShimmerButton from '../magicui/shimmer-button'
import { BookCall } from '../ui/bookcall'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { BookCall2 } from '../ui/bookdemo'
import { LetsCall } from '../ui/letscall'
import Link from 'next/link'
import ShineBorder from '../magicui/shine-border'
import Newsletter from './newsletter'
import { motion } from 'framer-motion'


export default function Footer() {


    const gearVariant = {
        hidden: { scale: 0.98 },
        visible: {
            scale: 1,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    return (
        <footer className='max-w-full p-4 w-full overflow-hidden'>
            <Separator className=' w-[95%] flex mt-12' />
            <div className='grid grid-cols-1 md:grid-cols-3  p-6 gap-12'>
                <div className='Zapllo my-8  '>
                    <img src='logo.png' className='h-6' />
                    <div className='flex gap-3 text-xs mt-6'>
                        <Link href='/Templates'>
                            <h1>TEMPLATE</h1>
                        </Link>
                        <Link href='/successstories'>
                            <h1>STORIES</h1>
                        </Link>
                        <Link href='/contact'>
                            <h1>CONTACT</h1>
                        </Link>
                    </div>
                    <div className='flex gap-3 mt-6'>
                        <img src="twitter.png" alt="" className='h-8' />
                        <img src="facebook.png" alt="" className='h-8' />
                        <img src="instagram.png" alt="" className='h-8' />
                    </div>
                    <div className='flex -ml-5 md:gap-4 mt-8'>
                        <Link
                            href="/dashboard"
                            className="relative inline-fl ex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                        >
                            <ShineBorder borderRadius={50}
                                className="text-center text-xl font-bold capitalize"
                                color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                            >
                                <h1>
                                    Get Started
                                </h1>
                            </ShineBorder>
                        </Link>
                        <LetsCall />
                    </div>
                </div>
                <div className='empty rectangle hidden lg:block '>
                    <motion.div className='-ml-12' initial="hidden" animate="visible" variants={gearVariant}>

                        <img src='shards.png' className='absolute -mt-40  h-56' />

                    </motion.div>
                    <img src='gear.png' className='h-[100%]' />
                </div>
                <div className=' overflow-visible my-8  '>
                    <div className='flex gap-6'>
                        {/* <img src='at.png' className='h-full' /> */}

                        <img src='at.gif' className='bg-gradient-to-r p-3 rounded-2xl from-[#815BF5] via-[#FC8929] to-[#FC8929]   h-20' />

                        <div>
                            <h1 className='text-lg   font-bold'>Subscribe to Zapllo Insider</h1>
                            <p className='text-[#676B93] text-xs mt-2'>Get latest updates on how technology is transforming Businesses and leveraging AI for 10X results</p>
                        </div>
                        {/* <img src='ellipse.png' className='absolute h- w-48 rounded-full object-cover' /> */}
                    </div>
                    <Newsletter />
                </div>
            </div>
            <Separator className=' w-[95%] flex -mt-6' />

            <div className='md:flex md:justify-between px-6 '>
                <div className='md:max-w-[600px]'>
                    <h1 className='text-[#676B93] mt-6 text-xs md:text-sm'>Copyright © 2024 Zapllo Technologies Private Limited. All rights reserved.</h1>
                    <p className='text-[#676B93] text-xs '>This site is not a part of the Facebook website or Facebook Inc. Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.</p>
                </div>
                <div className='md:flex grid grid-cols-2 gap-1 md:gap-2'>
                    <Link href='/disclaimer'>
                        <h1 className='text-[#676B93] mt-6 text-xs md:text-sm cursor-pointer hover:text-gray-200'>Disclaimer</h1>
                    </Link>
                    <h1 className='text-[#676B93] mt-6  hidden md:block text-xs md:text-sm'>|</h1>
                    <Link href='/terms'>
                        <h1 className='text-[#676B93] mt-6 text-xs md:text-sm cursor-pointer hover:text-gray-200'>Terms and Conditions</h1>
                    </Link>
                    <h1 className='text-[#676B93] hidden md:block mt-6 text-xs md:text-sm'>|</h1>
                    <Link href='/refundpolicy'>
                        <h1 className='text-[#676B93] mt-6 text-xs md:text-sm cursor-pointer hover:text-gray-200'>Refund Policy</h1>
                    </Link>
                    <h1 className='text-[#676B93] mt-6  hidden md:block text-xs md:text-sm'>|</h1>

                    <Link href='/privacypolicy'>
                        <h1 className='text-[#676B93] mt-6 text-xs md:text-sm cursor-pointer hover:text-gray-200'>Privacy Policy</h1>
                    </Link>
                    <h1 className='text-[#676B93] mt-6 hidden md:block text-xs md:text-sm'>|</h1>
                    <Link href='/contactus'>
                        <h1 className='text-[#676B93] mt-6 text-xs md:text-sm cursor-pointer hover:text-gray-200'>Contact Us</h1>
                    </Link>
                </div>
            </div>
        </footer >
    )
}
