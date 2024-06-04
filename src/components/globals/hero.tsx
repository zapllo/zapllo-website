
import React, { useRef, useState } from 'react'
import AnimatedGradientText from '../magicui/animated-gradient-text'
import { cn } from '@/lib/utils'
import { Golos_Text } from 'next/font/google';
import { ShinyText } from '../ui/shinytext';
import Image from 'next/image';
import VideoComponent from './video';

const golos = Golos_Text({ subsets: ["latin"] });


export default function Hero() {

    return (
        <div className='bg-[#05071E] '>
            <div className="z-10 flex items-center justify-center">
                <AnimatedGradientText>

                    <span
                        className={cn(
                            `inline animate- text-md text-center md:text-xl font-bold bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929]  bg-clip-text text-transparent`,
                        )}
                    >
                        Are you facing issues in you current Workflow  ?
                    </span>
                </AnimatedGradientText>

            </div>
            <div className='flex justify-center'>
                <h1 className='text-center text-2xl  md:text-5xl mt-4  font-bold mx-4 md:max-w-[1000px]'>Meet <span className='bg-gradient-to-r from-[#815BF5] bg-clip-text text-transparent font-bold  via-[#FC8929] to-[#FC8929]'>Zapllo</span> and unleash the power of Automation</h1>

            </div>

            <div className='flex justify-center '>
                <p className={`max-w-[1000px] text-center mx-4 md:mx-0 mt-4 md:text-lg leading-relaxed text-[#676B93] ${golos.className}`}>Maximize your Productivity by 10X with Zapllo&apos;s Custom Models and Seamless Integrations
                    <span className='text-white font-'> PARA 4.0 , CORE 2.0, Ultimate Notion Brain Ver 4.0 and Business OS. </span>
                    Effortlessly sync with Slack, Gmail, Hubspot, Salesforce, GoHighLevel, Custom CRMs, and more. </p>
            </div>
            <div className='flex -mt-8 justify-center'>
                <ShinyText />
            </div>
            <div className='flex justify-center -mt-8 mb-12 '>
                <img src='ratings.png' className='md:h-14 h-7' />
            </div>
            <div className='relative flex -mt-40 md:mt-0  justify-center '>

                <VideoComponent />
            </div>
        </div>
    )
}
