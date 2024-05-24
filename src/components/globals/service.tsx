"use client"

import React from 'react';
import { motion } from 'framer-motion';
import IconCloud from '../magicui/icon-cloud';

const cardVariants = (direction: string, delay: any) => ({
    hidden: { opacity: 0, x: direction === 'left' ? -200 : 200 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            delay
        }
    },
});

const slugs = [
    "whatsapp",
    "javascript",
    "notion",
    "discord",
    "slack",
    "googledrive",
    "android",
    "html5",
    "css3",
    "nodedotjs",
    "express",
    "nextdotjs",
    "prisma",
    "amazonaws",
    "postgresql",
    "firebase",
    "nginx",
    "vercel",
    "testinglibrary",
    "jest",
    "cypress",
    "docker",
    "git",
    "jira",
    "github",
    "gitlab",
    "visualstudiocode",
    "androidstudio",
    "sonarqube",
    "figma",
];

export default function Service() {
    return (
        <div className='text-center pt-12 bg-[#05071E] justify-center min-h-screen'>
            <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold text-3xl'>Services</h1>
            <h1 className='text-4xl mt-2 font-bold text-white'>Services we Provide</h1>
            <div className="flex flex-col md:flex-row justify-center mt-8">
                <div className='flex flex-col'>
                    <motion.div
                        className="bg-[#0A0D28] p-6 m-4 rounded-lg shadow-lg"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('left', 0.2)}
                    >
                        <h2 className="text-2xl font-bold">Interactive Dashboard</h2>
                        <p className="mt-2 w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                    </motion.div>
                    <motion.div
                        className="bg-[#0A0D28] p-6 m-4 rounded-lg shadow-lg"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('left', 0.6)}
                    >
                        <h2 className="text-2xl font-bold">Interactive Dashboard</h2>
                        <p className="mt-2 w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                    </motion.div>
                </div>
                <div className='flex items-center justify-center m-4'>
                    <IconCloud iconSlugs={slugs}  />
                </div>
                <div className='flex flex-col'>
                    <motion.div
                        className="bg-[#0A0D28] p-6 m-4 rounded-lg shadow-lg"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('right', 1.0)}
                    >
                        <h2 className="text-2xl font-bold">Interactive Dashboard</h2>
                        <p className="mt-2 w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                    </motion.div>
                    <motion.div
                        className="bg-[#0A0D28] p-6 m-4 rounded-lg shadow-lg"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('right', 1.4)}
                    >
                        <h2 className="text-2xl font-bold">Interactive Dashboard</h2>
                        <p className="mt-2 w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
