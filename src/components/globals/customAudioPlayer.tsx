'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CustomAudioPlayerProps {
    audioBlob: Blob | null;
    setAudioBlob: React.Dispatch<React.SetStateAction<Blob | null>>;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ audioBlob, setAudioBlob }) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    const audioURL = audioBlob ? URL.createObjectURL(audioBlob) : '';
    const audioRef = useRef<HTMLAudioElement>(new Audio(audioURL));

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleTimeUpdate = () => {
                setCurrentTime(audio.currentTime);
            };

            const handleLoadedMetadata = () => {
                setDuration(audio.duration);
            };
            audio.addEventListener('timeupdate', handleTimeUpdate);
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);

            return () => {
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [audioURL]);

    const handlePlayPause = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleMuteUnmute = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        const audio = audioRef.current;
        audio.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleClear = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        setAudioBlob(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    };

    return (
        <div>
            {audioBlob && (
                <div className='border p-2 rounded-lg'>
                    <h1 className='px-2 text-xs'>Voice Note</h1>

                    <div className="flex items-center gap-4  p-2 rounded-lg">
                        <div className="relative w-full h-2 bg-gray-600 rounded">
                            <div
                                className="absolute top-0 left-0 h-full  rounded"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-white text-sm">
                            {formatTime(currentTime)}
                        </span>
                        {/* <span className="text-white text-sm">
                        {formatTime(duration)}
                    </span> */}
                        {/* <button
                            onClick={handleMuteUnmute}
                            className=" text-white px-4 py-2 rounded-lg"
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button> */}
                        <button
                            onClick={handlePlayPause}
                            className="bg-[#017A5B] text-white h-8 w-10 rounded-full"
                        >
                            {isPlaying ? <img src='/icons/pause.png' className='h-6  w-8  ' /> : <img src='/icons/play.png' className='h-6 ml-1 w-7     object-contain  ' />}
                        </button>

                    </div>
                    <>
                        <div className='w-full flex mt-1 justify-end'>
                            <button
                                onClick={handleClear}
                                className="bg-transparent text-xs flex gap-2 border-[#505356]  border text-white px-4  py-1 rounded-lg"
                            >
                            <h1 className='text-red-400'>X</h1>    Clear
                            </button>
                        </div>

                    </>
                </div>
            )
            }
        </div >
    );
};

export default CustomAudioPlayer;
