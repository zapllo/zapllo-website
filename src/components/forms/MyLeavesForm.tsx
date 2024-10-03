'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';
import { Paperclip, Mic } from 'lucide-react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import CustomAudioPlayer from '../globals/customAudioPlayer';
import Loader from '../ui/loader';

interface LeaveFormProps {
    leaveTypes: any[]; // Leave types passed as prop

    onClose: () => void; // Prop to close the modal
}

interface LeaveDay {
    date: string;
    unit: 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter';
}

interface LeaveFormData {
    leaveType: string;
    fromDate: string;
    toDate: string;
    leaveReason: string;
    leaveDays: LeaveDay[];
}

const MyLeaveForm: React.FC<LeaveFormProps> = ({ leaveTypes, onClose }) => {
    const [formData, setFormData] = useState<LeaveFormData>({
        leaveType: '',
        fromDate: '',
        toDate: '',
        leaveReason: '',
        leaveDays: [],
    });

    const [availableUnits, setAvailableUnits] = useState<LeaveDay['unit'][]>([]);
    const [allotedLeaves, setAllotedLeaves] = useState<number | null>(null);
    const [userLeaveBalance, setUserLeaveBalance] = useState<number | null>(null);
    const [userLeaveBalances, setUserLeaveBalances] = useState<any[]>([]); // Store user leave balances
    const [error, setError] = useState<string | null>(null); // Error message state
    const audioURLRef = useRef<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [recording, setRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const [files, setFiles] = useState<File[]>([]); // State to manage file uploads
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/api/users/me'); // Adjust API endpoint as needed
                const user = response.data.data;

                if (user) {
                    // Set the user's leave balances
                    setUserLeaveBalances(user.leaveBalances);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'leaveType' && value) {
            const selectedLeaveType = leaveTypes.find((type) => type._id === value);
            if (selectedLeaveType) {
                const selectedUnits = [];
                if (selectedLeaveType.unit.includes('Full Day')) selectedUnits.push('Full Day');
                if (selectedLeaveType.unit.includes('Half Day')) {
                    selectedUnits.push('1st Half', '2nd Half');
                }
                if (selectedLeaveType.unit.includes('Short Leave')) {
                    selectedUnits.push('1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter');
                }
                setAvailableUnits(selectedUnits as LeaveDay['unit'][]);

                // Set allotted leaves and user balance
                setAllotedLeaves(selectedLeaveType.allotedLeaves);
                // Find the user's leave balance for the selected leave type
                const userLeaveBalanceForType = userLeaveBalances.find(
                    (balance) => balance.leaveType === value
                );

                // Set the leave balance for the selected leave type
                setUserLeaveBalance(userLeaveBalanceForType ? userLeaveBalanceForType.balance : null);
            }
        }
    };

    const handleUnitChange = (date: string, newUnit: LeaveDay['unit']) => {
        const updatedLeaveDays = formData.leaveDays.map((day) =>
            day.date === date ? { ...day, unit: newUnit } : day
        );
        setFormData((prevData) => ({ ...prevData, leaveDays: updatedLeaveDays }));
    };

    const calculateRequestedDays = () => {
        const { fromDate, toDate } = formData;
        if (fromDate && toDate) {
            const start = new Date(fromDate);
            const end = new Date(toDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end date
            return diffDays;
        }
        return 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // First, upload files (including audio) to /api/upload
        let fileUrls: string[] = [];
        let audioUrl: string | null = null;

        // Prepare the FormData object to hold the files and audio for upload
        const formDataToUpload = new FormData();

        if (files.length > 0) {
            files.forEach(file => formDataToUpload.append('files', file)); // Add each file to the FormData
        }

        if (audioBlob) {
            formDataToUpload.append('audio', audioBlob, 'audio.wav'); // Add the audio to the FormData
        }

        // If there are files or audio, make the API call to upload them
        if (files.length > 0 || audioBlob) {
            try {
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formDataToUpload,
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    fileUrls = uploadData.fileUrls || []; // Array of uploaded file URLs
                    audioUrl = uploadData.audioUrl || null; // Audio URL if present
                } else {
                    console.error('Failed to upload files.');
                    return;
                }
            } catch (error) {
                console.error('Error uploading files:', error);
                return;
            }
        }

        // Now that we have the file and audio URLs, submit the leave request to the database
        const leaveRequestData = {
            leaveType: formData.leaveType,
            fromDate: formData.fromDate,
            toDate: formData.toDate,
            leaveReason: formData.leaveReason,
            attachment: fileUrls, // List of file URLs
            audioUrl: audioUrl, // Audio URL (if available)
            leaveDays: formData.leaveDays,
        };

        try {
            setLoading(true);
            const response = await fetch('/api/leaves', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leaveRequestData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Leave request submitted successfully:', data);
                onClose(); // Close the modal on successful submission
            } else {
                console.error('Failed to submit leave request.');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error submitting leave request:', error);
        }
        setLoading(false);
        onClose();
    };


    useEffect(() => {
        if (formData.fromDate && formData.toDate) {
            const start = new Date(formData.fromDate);
            const end = new Date(formData.toDate);
            const dateArray: LeaveDay[] = [];

            while (start <= end) {
                const formattedDate = start.toISOString().split('T')[0];
                dateArray.push({ date: formattedDate, unit: 'Full Day' });
                start.setDate(start.getDate() + 1);
            }

            setFormData((prevData) => ({ ...prevData, leaveDays: dateArray }));
        }
    }, [formData.fromDate, formData.toDate]);

    useEffect(() => {
        // Check if the requested leave days exceed the user's balance
        const requestedDays = calculateRequestedDays();
        if (userLeaveBalance !== null && requestedDays > userLeaveBalance) {
            setError('Exceeded leave request balance');
        } else {
            setError(null);
        }
    }, [formData.fromDate, formData.toDate, userLeaveBalance]);

    // Handle file upload logic
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;

        if (selectedFiles && selectedFiles.length > 0) {
            const validFiles: File[] = [];

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                validFiles.push(file);
            }

            if (validFiles.length > 0) {
                setFiles(validFiles); // Update state with all selected files
            }
        }
    };

    const removeFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index)); // Remove the file at the specified index
    };

    // Handle audio recording logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext; // Type assertion
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 2048;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current = analyser;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    const blob = new Blob([event.data], { type: 'audio/wav' });
                    setAudioBlob(blob);
                    const audioURL = URL.createObjectURL(blob);
                    audioURLRef.current = audioURL;
                }
            };

            mediaRecorder.onstop = () => {
                setRecording(false);
            };

            mediaRecorder.start();
            setRecording(true);

            // Real-time waveform visualization
            const canvas = canvasRef.current;
            if (canvas) {
                const canvasCtx = canvas.getContext('2d');
                if (canvasCtx) {
                    const drawWaveform = () => {
                        if (analyserRef.current) {
                            requestAnimationFrame(drawWaveform);
                            analyserRef.current.getByteTimeDomainData(dataArray);
                            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                            canvasCtx.lineWidth = 2;
                            canvasCtx.strokeStyle = 'green';
                            canvasCtx.beginPath();

                            const sliceWidth = canvas.width * 1.0 / bufferLength;
                            let x = 0;

                            for (let i = 0; i < bufferLength; i++) {
                                const v = dataArray[i] / 128.0; // Convert to 0.0 to 1.0
                                const y = v * canvas.height / 2; // Convert to canvas height

                                if (i === 0) {
                                    canvasCtx.moveTo(x, y);
                                } else {
                                    canvasCtx.lineTo(x, y);
                                }

                                x += sliceWidth;
                            }

                            canvasCtx.lineTo(canvas.width, canvas.height / 2);
                            canvasCtx.stroke();
                        }
                    };

                    drawWaveform();
                }
            }

            mediaRecorderRef.current = mediaRecorder;
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
    };

    return (
        <Dialog.Root open onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0  bg-black/50 opacity- z-50" />
                <Dialog.Content className="fixed z-[100] inset-0 flex items-center justify-center">
                    <div className="bg-[#1A1C20] overflow-y-scroll scrollbar-hide h-[420px] shadow-lg w-full   max-w-lg p-6 rounded-lg">
                        <div className="flex justify-between mb-4">
                            <Dialog.Title className="text-md mb-4 font-medium">Submit Leave Request</Dialog.Title>
                            <Dialog.DialogClose className="-mt-4">X</Dialog.DialogClose>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 ">
                            <div className='relative'>
                                <label className="absolute bg-[#1A1C20] ml-2 text-xs -mt-2 px-1">Leave Type</label>
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleInputChange}
                                    className="w-full text-xs p-2 bg-[#1A1C20] outline-none border rounded bg-transparent"
                                >
                                    <option className='bg-[#1A1C20]' value="">Select Leave Type</option>
                                    {leaveTypes.map((type) => (
                                        <option key={type._id} className='bg-[#1A1C20]' value={type._id}>
                                            {type.leaveType}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Display Allotted Leaves and Balance */}
                            {allotedLeaves !== null && userLeaveBalance !== null && (
                                <div className="mt-2 flex justify-between text-xs text-white bg-[#282d32] p-2 rounded">
                                    <p>Total Allotted Leaves: {allotedLeaves}</p>
                                    <p>Remaining Balance: {userLeaveBalance}</p>
                                </div>
                            )}

                            <div className="flex justify-between space-x-4">
                                <div className="relative b w-full">
                                    <label className="absolute bg-[#1A1C20] ml-2 z-[100] text-xs -mt-2 px-1">From Date</label>
                                    <input
                                        type="date"
                                        name="fromDate"
                                        value={formData.fromDate}
                                        onChange={handleInputChange}
                                        className="w-full text-sm p-2 outline-none opacity-65 border rounded bg-transparent"
                                    />
                                </div>
                                <div className="relative w-full">
                                    <label className="absolute bg-[#1A1C20] ml-2 text-xs z-[100] -mt-2 px-1">To Date</label>
                                    <input
                                        type="date"
                                        name="toDate"
                                        value={formData.toDate}
                                        onChange={handleInputChange}
                                        className="w-full text-sm p-2 outline-none border opacity-65 rounded bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* Dynamically generated leave days with unit selection */}
                            <div>
                                {formData.toDate && formData.fromDate && formData.leaveDays.map((day, index) => (
                                    <div key={index} className="mb-2 flex border p-2 justify-between">
                                        <span className="text-sm mt-2">{day.date}</span>
                                        <select
                                            value={day.unit}
                                            onChange={(e) => handleUnitChange(day.date, e.target.value as LeaveDay['unit'])}
                                            className="ml-2 p-2 border bg-transparent outline-none rounded text-sm"
                                        >
                                            {availableUnits.map((unit) => (
                                                <option key={unit} className='bg-[#1A1C20]' value={unit}>
                                                    {unit}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div >
                                <div className='relative'>
                                    <label className="absolute bg-[#1A1C20] ml-2 text-xs -mt-2 px-1">Leave Reason</label>
                                </div>
                                <textarea
                                    name="leaveReason"
                                    value={formData.leaveReason}
                                    onChange={handleInputChange}
                                    className="w-full text-sm p-2 border bg-transparent outline-none rounded"
                                />
                            </div>

                            {/* Display Error if leave request exceeds balance */}
                            {error && <p className="text-red-500 text-xs">{error}</p>}

                            {/* Audio Recording and File Attachment */}
                            <div className='flex gap-4'>
                                {/* <div  className={`h-8 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-[#282D32]`}> */}
                                {recording ? (
                                    <div onClick={stopRecording} className='h-8  w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm   bg-red-500'>
                                        <Mic className='h-5 text-center m-auto mt-1' />
                                    </div>
                                ) : (
                                    <div onClick={startRecording} className='h-8  w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-[#282D32]'>
                                        <Mic className='h-5 text-center m-auto mt-1' />
                                    </div>
                                )}
                                {/* </div> */}
                                <input
                                    ref={fileInputRef}
                                    id="file-upload"
                                    type="file"
                                    className=''
                                    multiple
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }} // Hide the file input
                                />
                                <label htmlFor='file-upload' className='h-8  w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-[#282D32]'>
                                    <Paperclip className='h-5 text-center m-auto mt-1' />
                                    {/* <span>Attach Files</span> */}
                                </label>
                            </div>

                            {/* Display selected files */}
                            {files.length > 0 && (
                                <ul className='list-disc list-inside'>
                                    {files.map((file, index) => (
                                        <li key={index} className='flex justify-between items-center'>
                                            {file.name}
                                            <button onClick={() => removeFile(index)} className='text-red-500 ml-2'>
                                                <FaTimes className='h-4 w-4' />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <canvas ref={canvasRef} className={` ${recording ? `w-1/2 h-fit` : 'hidden'} `}></canvas>
                            {audioBlob && (
                                <CustomAudioPlayer audioBlob={audioBlob} setAudioBlob={setAudioBlob} />
                            )}

                            <div className="flex justify-end ">
                                <button
                                    type="submit"
                                    className="bg-[#017A5B] w-full text-sm cursor-pointer  text-white px-4 mt-6  py-2 rounded"
                                    disabled={!formData.leaveType || formData.leaveDays.length === 0 || error !== null}
                                >
                                    {loading ? <Loader /> : 'Submit Leave Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default MyLeaveForm;
