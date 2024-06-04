"use client"

import React from 'react';
import { motion } from 'framer-motion';
import IconCloud from '../magicui/icon-cloud';
import { Eye } from 'lucide-react';
import { FloatingWhatsApp } from 'react-floating-whatsapp'
import GradientText from '../magicui/gradient';
import SignalIcon from '../ui/signal';


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
    const imgSrc1 = 'deep.png';
    const imgSrc2 = 'Aditya1.png';
    const imgSrc3 = 'Jas.png';
    const imgSrc4 = 'Jas.png';
    const imgSrc5 = 'Jas.png';
    const imgSrc6 = 'Jas.png';

    return (
        <div className='text-center pt-12 bg-[#05071E] justify-center min-h-screen'>
            <FloatingWhatsApp phoneNumber="+917064267635" accountName="Shubhodeep" avatar='/avatar.png' darkMode />
            <GradientText>
                <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold text-3xl'>Services</h1>
            </GradientText>
            <h1 className='text-4xl mt-2 font-bold text-white'>Services we Provide</h1>
            <div className="flex flex-col md:flex-row justify-center mt-8">
                <div className='flex flex-col'>
                    <motion.div
                        className=" bg-[#0A0D28]  m-4"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('left', 0.2)}
                    >
                        <div>
                            <img src='/card/01.jpg' className='w-full h-40 rounded-lg  object-cover rounded-b-none' />

                            <div className=' flex -mt-10  ml-[80%]'>
                                <div className='flex justify-center'>
                                    <SignalIcon imgSrc={imgSrc1} />


                                </div>
                            </div>
                        </div>
                        <div className='p-8 rounded-lg shadow-lg'>
                            <h2 className="text-xl text-start font-bold">Interactive Notion Dashboards</h2>
                            <p className="mt-2 w-[300px] text-start  md:w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                        </div>
                    </motion.div>
                    <motion.div
                        className=" bg-[#0A0D28] mt-32 m-4"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('left', 1.2)}
                    >
                        <div>
                            <img src='/card/01.jpg' className='w-full h-40 rounded-lg  object-cover rounded-b-none' />
                            <div className=' flex -mt-10  ml-[80%]'>
                                <div className='flex justify-center'>
                                    <SignalIcon imgSrc={imgSrc2} />



                                </div>
                            </div>
                        </div>
                        <div className='p-8 rounded-lg shadow-lg'>
                            <h2 className="text-2xl text-start font-bold">Done for you Custom Automations</h2>
                            <p className="mt-2 w-[300px] text-start  md:w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                        </div>
                    </motion.div>
                    <motion.div
                        className=" bg-[#0A0D28] mt-32 m-4"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('left', 2.2)}
                    >
                        <div>
                            <img src='/card/01.jpg' className='w-full h-40 rounded-lg  object-cover rounded-b-none' />
                            <div className=' flex -mt-10  ml-[80%]'>
                                <div className='flex justify-center'>
                                    <SignalIcon imgSrc={imgSrc3} />


                                </div>
                            </div>
                        </div>
                        <div className='p-8 rounded-lg shadow-lg'>
                            <h2 className="text-2xl text-start font-bold">Cross Platform Integrations</h2>
                            <p className="mt-2 w-[300px] text-start  md:w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                        </div>
                    </motion.div>
                </div>
                {/* <div className='flex items-center justify-center m-4'>
                    <IconCloud iconSlugs={slugs}  />
                </div> */}
                <div className='flex flex-col'>
                    <motion.div
                        className=" bg-[#0A0D28] mt-32 m-4"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('right', 0.6)}
                    >
                        <div>
                            <img src='/card/01.jpg' className='w-full h-40 rounded-lg  object-cover rounded-b-none' />
                            <div className=' flex -mt-10  ml-[80%]'>
                                <div className='flex justify-center'>
                                    <SignalIcon imgSrc={imgSrc4} />


                                </div>
                            </div>
                        </div>
                        <div className='p-8 rounded-lg shadow-lg'>
                            <h2 className="text-2xl text-start font-bold">Generative AI</h2>
                            <p className="mt-2 w-[300px] text-start  md:w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                        </div>
                    </motion.div>
                    <motion.div
                        className=" bg-[#0A0D28] mt-32 m-4"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('right', 1.8)}
                    >
                        <div>
                            <img src='/card/01.jpg' className='w-full h-40 rounded-lg  object-cover rounded-b-none' />
                            <div className=' flex -mt-10  ml-[80%]'>
                                <div className='flex justify-center'>
                                    <SignalIcon imgSrc={imgSrc5} />


                                </div>
                            </div>
                        </div>
                        <div className='p-8 rounded-lg shadow-lg'>
                            <h2 className="text-2xl text-start font-bold">Powerful Notion Teamspaces</h2>
                            <p className="mt-2 w-[300px] text-start  md:w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                        </div>
                    </motion.div>
                    <motion.div
                        className=" bg-[#0A0D28] mt-32 m-4"
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants('right', 2.8)}
                    >
                        <div>
                            <img src='/card/01.jpg' className='w-full h-40 rounded-lg  object-cover rounded-b-none' />
                            <div className=' flex -mt-10  ml-[80%]'>
                                <div className='flex justify-center'>
                                    <SignalIcon imgSrc={imgSrc6} />


                                </div>
                            </div>
                        </div>
                        <div className='p-8 rounded-lg shadow-lg'>
                            <h2 className="text-2xl text-start font-bold">Business Operations</h2>
                            <p className="mt-2 w-[300px] text-start  md:w-[400px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat necessitatibus harum, ipsa repudiandae, debitis placeat quam quo quia incidunt consequatur deserunt officiis quisquam expedita asperiores. Quod repellendus pariatur atque ea!</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

const items = [
    {
        image: 'deep.png',
    },

];