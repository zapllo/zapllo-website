'use client'

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Mic } from 'lucide-react';
import CustomAudioPlayer from '@/components/globals/customAudioPlayer';

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
    attachment: File | string;
    audioUrl: Blob | string;
    leaveDays: LeaveDay[];
}

const MyLeaveForm: React.FC<LeaveFormProps> = ({ leaveTypes, onClose }) => {
    const [formData, setFormData] = useState<LeaveFormData>({
        leaveType: '',
        fromDate: '',
        toDate: '',
        leaveReason: '',
        attachment: '',
        audioUrl: '',
        leaveDays: [],
    });

    const [isRecording, setIsRecording] = useState(false);
    const [fileAttachment, setFileAttachment] = useState<File | null>(null);
    const [allotedLeaves, setAllotedLeaves] = useState<number | null>(null);
    const [userLeaveBalance, setUserLeaveBalance] = useState<number | null>(null);
    const [availableUnits, setAvailableUnits] = useState<LeaveDay['unit'][]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // When leaveType is changed, fetch the related balance and available units
        if (name === 'leaveType' && value) {
            fetchLeaveDetails(value);
            const selectedLeaveType = leaveTypes.find((type) => type._id === value);
            if (selectedLeaveType) {
                // Determine which units are available based on the selected leave type
                const selectedUnits = [];
                if (selectedLeaveType.unit.includes('Full Day')) selectedUnits.push('Full Day');
                if (selectedLeaveType.unit.includes('Half Day')) {
                    selectedUnits.push('1st Half', '2nd Half');
                }
                if (selectedLeaveType.unit.includes('Short Leave')) {
                    selectedUnits.push('1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter');
                }
                setAvailableUnits(selectedUnits as LeaveDay['unit'][]);
            }
        }
    };

    const fetchLeaveDetails = async (leaveTypeId: string) => {
        try {
            const response = await axios.get(`/api/leaves/${leaveTypeId}`);
            if (response.data.success) {
                setAllotedLeaves(response.data.data.allotedLeaves);
                setUserLeaveBalance(response.data.data.userLeaveBalance);
            } else {
                setAllotedLeaves(null);
                setUserLeaveBalance(null);
            }
        } catch (error) {
            console.error('Error fetching leave details:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const leaveData = {
                leaveType: formData.leaveType,
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                leaveReason: formData.leaveReason,
                leaveDays: formData.leaveDays,
                attachment: fileAttachment || '',
                audioUrl: '', // Assuming audio recording logic is handled elsewhere
            };

            await axios.post('/api/leaves', leaveData);
            onClose();
            alert('Leave request submitted successfully');
        } catch (error) {
            console.error('Error applying for leave:', error);
        }
    };

    const handleUnitChange = (date: string, newUnit: LeaveDay['unit']) => {
        const updatedLeaveDays = formData.leaveDays.map((day) =>
            day.date === date ? { ...day, unit: newUnit } : day
        );
        setFormData((prevData) => ({ ...prevData, leaveDays: updatedLeaveDays }));
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-2">Leave Type</label>
                <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    className="w-full p-2 border"
                >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                            {type.leaveType}
                        </option>
                    ))}
                </select>
                {allotedLeaves !== null && userLeaveBalance !== null && (
                    <div className="mt-2 flex justify-between">
                        <p>Total Allotted Leaves: {allotedLeaves}</p>
                        <p>Remaining Balance: {userLeaveBalance}</p>
                    </div>
                )}
            </div>

            <div className='flex justify-between'>
                <div>
                    <label className="block mb-2">From Date</label>
                    <input
                        type="date"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border"
                    />
                </div>

                <div>
                    <label className="block mb-2">To Date</label>
                    <input
                        type="date"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border"
                    />
                </div>
            </div>

            {/* Dynamically generated leave days with unit selection */}
            <div>
                <label className="block mb-2">Leave Days</label>
                {formData.leaveDays.map((day, index) => (
                    <div key={index} className="mb-2">
                        <span>{day.date}:</span>
                        <select
                            value={day.unit}
                            onChange={(e) => handleUnitChange(day.date, e.target.value as LeaveDay['unit'])}
                            className="ml-2 p-2 border"
                        >
                            {availableUnits.map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <div>
                <label className="block mb-2">Leave Reason</label>
                <textarea
                    name="leaveReason"
                    value={formData.leaveReason}
                    onChange={handleInputChange}
                    className="w-full p-2 border"
                />
            </div>

            <div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={formData.leaveDays.length === 0 || !formData.leaveType}
                >
                    Submit Leave Request
                </button>
            </div>
        </form>
    );
};

export default MyLeaveForm;
