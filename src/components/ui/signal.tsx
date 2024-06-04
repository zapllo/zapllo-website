"use client";

import React from 'react';
import { motion } from 'framer-motion';

const waveVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (i: number) => ({
        scale: [0.8, 1.5],
        opacity: [1, 0],
        transition: {
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1,
            delay: i * 0.5,
        },
    }),
};

const SignalIcon: React.FC = () => {
    const renderWaveCircles = () => {
        return [0, 1, 2].map((i) => (
            <>
             
                <motion.div
                    key={i}
                    className="absolute rounded-full  border-[#53A1F3] border-2 h-16 w-16"
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={waveVariants}
                />
                <motion.div
                    key={i}
                    className="absolute rounded-full  border-[#53A1F3] border-4 h-20 w-20"
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={waveVariants}
                />
            </>
        ));
    };

    return (
        <div className="relative flex items-center justify-center h-20 w-20">
            {renderWaveCircles()}
            <div className="absolute h-16 w-16  rounded-full flex items-center justify-center">
            <div className="absolute h-16 w-16 border border-blue-400 z-[100] rounded-full flex items-center justify-center"/>
            <div className="absolute h-[60px] w-[60px] border border-blue-400 z-[100] rounded-full flex items-center justify-center"/>
            <div className="absolute h-14 w-14 border border-blue-400 z-[100] rounded-full flex items-center justify-center"/>
            <div className="absolute h-16 w-16 border bg-[#4CD5FA] border-blue-700  rounded-full flex items-center justify-center"/>
                <span className="text-white text-2xl z-[100]">Icon</span>
            </div>
        </div>
    );
};

export default SignalIcon;
