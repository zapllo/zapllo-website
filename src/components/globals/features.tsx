import React from 'react'
import { AnimatedFeatures } from './features-animated'
import { OrbitingCirclesDemo } from './orbits'
import { TypewriterEffectSmooth } from '../ui/typewriter-effect'
import { TextGenerateEffect } from '../ui/text-generate-effect';
import { FlipWordsDemo } from './flip-words';

export default function Features() {
    const words = [
        {
            text: "All this with",
            className: "text-3xl"
        },

        {
            text: "Zapllo.",
            className: "text-blue-500 text-4xl dark:text-[#DF7533]",
        },
    ];
    return (
        <div className='grid grid-cols-1 md:grid-cols-2  gap-8 mt-24 max-w-[1100px] '>
            <div>
                {/* <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold text-4xl'>Key Features</h1> */}
                <FlipWordsDemo />
                <p className='mt-4 text-[#676B93] text-start'>
                🚀 Supercharge your workflow with Zapllo ! Our done-for-you solutions, custom-crafted Notion systems, AI models, and tailored automations elevate your tech game. Whether you are a startup, e-commerce guru, entrepreneur, lawyer, realtor, doctor, or simply enhancing your personal efficiency, our expert engineers guide you to the perfect tools. At Zapllo, we craft cutting-edge solutions for every need. Lets innovate together ! 🤝
                </p>
                {/* <TypewriterEffectSmooth words={words} /> */}

            </div>

            <OrbitingCirclesDemo />

        </div>
    )
}
