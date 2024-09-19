// components/modals/RegularizationApprovalModal.tsx

'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface RegularizationApprovalModalProps {
    regularizationId: string;
    timestamp: string;
    loginTime: string;
    logoutTime: string;
    remarks: string;
    onClose: () => void;
    onSubmit: () => void;
}

const RegularizationApprovalModal: React.FC<RegularizationApprovalModalProps> = ({
    regularizationId,
    timestamp,
    loginTime,
    logoutTime,
    remarks,
    onClose,
    onSubmit
}) => {
    const [approvalStatus, setApprovalStatus] = useState<'approve' | 'reject'>('approve');
    const [approvalRemarks, setApprovalRemarks] = useState<string>('');

    const handleSubmit = async () => {
        try {
            const response = await axios.patch(`/api/regularization-approvals/${regularizationId}`, {
                action: approvalStatus.toLowerCase(), // 'approve' or 'reject'
                notes: approvalRemarks,
            });

            if (response.data.success) {
                onSubmit(); // Refresh data or perform other actions
            } else {
                throw new Error(response.data.message || 'Failed to update regularization.');
            }
        } catch (error: any) {
            console.error('Error updating regularization:', error.response?.data || error.message);
            alert(error.message || 'An error occurred while updating the regularization.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1A1C20] p-6 rounded-md w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4 text-white">Approve Regularization Request</h2>

                <div className="mb-4">
                    <p><strong>Date:</strong> {new Date(timestamp).toLocaleDateString()}</p>
                    <p><strong>Login Time:</strong> {loginTime}</p>
                    <p><strong>Logout Time:</strong> {logoutTime}</p>
                    <p><strong>Remarks:</strong> {remarks}</p>
                </div>

                <div className="mb-4">
                    <h3 className="text-white mb-2">Approval Status</h3>
                    <select
                        value={approvalStatus}
                        onChange={(e) => setApprovalStatus(e.target.value as 'approve' | 'reject')}
                        className="w-full p-2 rounded-md bg-gray-800 text-white"
                    >
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                    </select>
                </div>


                <div className="mb-4">
                    <h3 className="text-white mb-2">Add a note</h3>
                    <textarea
                        value={approvalRemarks}
                        onChange={(e) => setApprovalRemarks(e.target.value)}
                        className="w-full p-2 rounded-md bg-gray-800 text-white"
                        placeholder="Please add a note"
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

export default RegularizationApprovalModal;
