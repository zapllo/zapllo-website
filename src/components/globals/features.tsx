import React from 'react'
import { AnimatedFeatures } from './features-animated'

export default function Features() {
    return (
        <div className='grid gri-cols-1 md:grid-cols-2  gap-4 mt-24 max-w-[1000px] '>
            <div>
                <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold text-4xl'>Key Features</h1>
                <p className='mt-4 text-[#676B93] text-justify'>
                    🚀 Supercharge your workflow with Zapllo ! Our done-for-you solutions, custom-crafted Notion systems, AI models, and tailored automations elevate your tech game. Whether you&apos;re a startup, e-commerce guru, entrepreneur, lawyer, realtor, doctor, or simply enhancing your personal efficiency, our expert engineers guide you to the perfect tools. At Zapllo, we craft cutting-edge solutions for every need.<br></br> Let&apos;s innovate together 🤝! 
                   </p>
            </div>

            <AnimatedFeatures />

        </div>
    )
}
