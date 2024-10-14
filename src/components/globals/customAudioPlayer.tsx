'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CustomAudioPlayerProps {
    audioBlob?: Blob | null;
    audioUrl?: string | null;
    setAudioBlob?: React.Dispatch<React.SetStateAction<Blob | null>>;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ audioBlob, audioUrl, setAudioBlob }) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    const audioSrc = audioBlob ? URL.createObjectURL(audioBlob) : audioUrl || '';
    const audioRef = useRef<HTMLAudioElement>(null);

    // Update the audio src when audioBlob or audioUrl changes
    useEffect(() => {
        if (audioRef.current && audioSrc) {
            audioRef.current.src = audioSrc;
            audioRef.current.load();
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        }
    }, [audioBlob, audioUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleTimeUpdate = () => {
                setCurrentTime(audio.currentTime);
            };

            const handleLoadedMetadata = () => {
                setDuration(audio.duration); // Ensure duration is correctly set
            };

            audio.addEventListener('timeupdate', handleTimeUpdate);
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);

            return () => {
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, []);

    const handlePlayPause = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        const audio = audioRef.current;
        if (audio) {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleMuteUnmute = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        const audio = audioRef.current;
        if (audio) {
            audio.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleClear = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        if (setAudioBlob) {
            setAudioBlob(null);
        }
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    };

    return (
        <div className=' bg-[#282d32] rounded mt-2'>
            {audioSrc && (
                <div className='border p-1 px-2 h-12 mb-4 rounded-lg'>
                    <h1 className='p text-xs'>Voice Note</h1>
                    <div className="flex items-center gap-4  rounded-lg">
                        <div className="relative w-[80%] h-1 bg-gray-600 rounded">
                            <div
                                className="absolute top-0 left-0 h-full bg-green-500 rounded"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            ></div>
                        </div>
                        <div className="text-white text-sm">
                            <span>{formatTime(currentTime)}</span>
                        </div>
                        <button
                            onClick={handlePlayPause}
                            className="bg-[#017A5B] text-white h-5 w-5 rounded-full"
                        >
                            {isPlaying ? (
                                <img src='/icons/pause.png' className='h-4 w-4 object-contain ml-[2px]' />
                            ) : (
                                <img src='/icons/play.png' className='h-4 ml-1 w-4 object-contain' />
                            )}
                        </button>
                        {setAudioBlob && (
                            <div className=' flex  justify-end'>
                                <button
                                    onClick={handleClear}
                                    className="bg-transparent text-xs flex gap border-[#505356] border text-white h-5 w-5 items-center  rounded-full"
                                >
                                    <h1 className='text-red-400 ml-[5px]'>X</h1>
                                </button>
                            </div>
                        )}
                    </div>
                    <audio ref={audioRef} controls className='hidden' />
                </div>
            )}
        </div>
    );
};

export default CustomAudioPlayer;
