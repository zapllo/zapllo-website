'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface LeaveDay {
    date: string;
    unit: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

interface LeaveApprovalModalProps {
    leaveId: string;
    leaveDays: LeaveDay[];
    appliedDays: number;
    leaveReason: string;
    onClose: () => void;
    onSubmit: () => void;
}

const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({ leaveId, leaveDays, appliedDays, leaveReason, onClose, onSubmit }) => {
    const [approvalData, setApprovalData] = useState<LeaveDay[]>(leaveDays);
    const [remarks, setRemarks] = useState<string>(''); // State for remarks

    // Handle the status change (either Approve or Reject)
    const handleStatusChange = (date: string, newStatus: 'Approved' | 'Rejected') => {
        setApprovalData(prevData =>
            prevData.map(day =>
                day.date === date ? { ...day, status: newStatus } : day
            )
        );
    };

    // Submit the approval/rejection data to the backend
    const handleSubmit = async () => {
        console.log('Submitting leave days:', approvalData);  // Check the state
        try {
            const response = await axios.post(`/api/leaveApprovals/${leaveId}`, {
                leaveDays: approvalData,
                remarks,
                action: approvalData.every(day => day.status === 'Approved') ? 'approve' : 'reject' // Send action
            });  // Pass remarks
            if (response.data.success) {
                console.log('Response from API:', response.data);
                onSubmit(); // Proceed if successful
            } else {
                console.error('API Error:', response.data.error);
            }
        } catch (error) {
            console.error('Request failed:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1A1C20] p-6 rounded-md w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4 text-white">Approve Leave Request</h2>

                <div className="mb-4">
                    <div className="mb-2">
                        <strong className="text-white">Leave Reason:</strong>
                        <p className="text-gray-300">{leaveReason}</p>
                    </div>
                    <div className="mb-2">
                        <strong className="text-white">Applied for:</strong>
                        <p className="text-gray-300">{appliedDays} day(s)</p>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-white mb-2">Leave Days</h3>
                    {approvalData?.map((day, index) => (
                        <div key={index} className="flex justify-between items-center mb-2 bg-gray-800 p-2 rounded-md">
                            <span className="text-white">{day.date} ({day.unit})</span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleStatusChange(day.date, 'Approved')}
                                    className={`px-3 py-1 rounded ${day.status === 'Approved' ? 'bg-[#017A5B] text-white' : 'bg-gray-500 text-white'}`}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleStatusChange(day.date, 'Rejected')}
                                    className={`px-3 py-1 rounded ${day.status === 'Rejected' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-4">
                    <h3 className="text-white mb-2">Remarks (optional)</h3>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full p-2 rounded-md bg-gray-800 text-white"
                        placeholder="Add any remarks for approval or rejection"
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleSubmit}
                        className="bg-[#017A5B] text-white px-4 py-2 rounded">
                        Submit
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeaveApprovalModal;
