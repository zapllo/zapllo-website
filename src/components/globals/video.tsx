"use client"
import { PlayIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';

export default function VideoComponent() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    return (
        <div className='relative w-[900px] md:mt-0 mt h-[500px]'>
            <video
                ref={videoRef}
                className='rounded-xl shadow-2xl shadow-blue-500/20 w-full h-full max-w-[900px]'
                preload="auto"
            >
                <source src="/intro.mp4" type="video/mp4" />
            </video>
            {!isPlaying && (
                <div className='absolute inset-0 flex items-center justify-center'>
                    <button
                        onClick={handlePlay}
                        className="flex items-center justify-center bg-gradient-to-r from-[#815BF5] to-[#FC8929] rounded-full h-20 w-20 text-white"
                    >
                        <PlayIcon className='h-8 w-8' />
                    </button>
                </div>
            )}
        </div>
    );
}
