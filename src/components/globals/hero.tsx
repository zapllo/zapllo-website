import React from 'react'
import AnimatedGradientText from '../magicui/animated-gradient-text'
import { cn } from '@/lib/utils'
import { Golos_Text } from 'next/font/google';
import { ShinyText } from '../ui/shinytext';
import Image from 'next/image';

const golos = Golos_Text({ subsets: ["latin"] });


export default function Hero() {
    return (
        <div className='bg-[#05071E]'>
            <div className="z-10 flex items-center justify-center">
                <AnimatedGradientText>

                    <span
                        className={cn(
                            `inline animate-gradient font-bold bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                        )}
                    >
                        Are you facing issues in you current Workflow  ?
                    </span>
                </AnimatedGradientText>

            </div>
            <div className='flex justify-center'>
                <h1 className='text-center text-5xl mt-4  font-bold mx-4 md:max-w-[1000px]'>Meet <span className='bg-gradient-to-r from-[#815BF5] bg-clip-text text-transparent font-bold  via-[#FC8929] to-[#FC8929]'>Zapllo</span> and unleash the power of Automation</h1>

            </div>

            <div className='flex justify-center '>
                <p className={`max-w-[1000px] text- mt-4 text-lg leading-relaxed text-[#676B93] ${golos.className}`}>Maximize your Productivity by 10X with Zapllo's Custom Models and Seamless Integrations
                    <span className='text-white font-'> PARA 4.0 , CORE 2.0, Ultimate Notion Brain Ver 4.0 and Business OS. </span>
                      Effortlessly sync with Slack, Gmail, Hubspot, Salesforce, GoHighLevel, Custom CRMs, and more."</p>
            </div>
            <div className='flex -mt-8 justify-center'>
                <ShinyText />
            </div>
            <div className='flex justify-center'>
                <video src='/intro.mp4' muted autoPlay loop className='rounded-xl shadow-2xl shadow-blue-500/20  max-w-[900px]' />
            </div>
        </div>
    )
}
