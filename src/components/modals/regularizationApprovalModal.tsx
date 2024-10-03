'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

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
    const [approvalRemarks, setApprovalRemarks] = useState<string>('');
    const [loading, setLoading] = useState(false); // For handling loading state

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.patch(`/api/regularization-approvals/${regularizationId}`, {
                action: 'approve', // Automatically approving
                notes: approvalRemarks,
            });

            if (response.data.success) {
                onSubmit(); // Refresh data or perform other actions
            } else {
                throw new Error(response.data.message || 'Failed to approve regularization.');
            }
        } catch (error: any) {
            console.error('Error approving regularization:', error.response?.data || error.message);
            alert(error.message || 'An error occurred while approving the regularization.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1A1D21] rounded-lg p-6 mx-auto max-w-xl w-full">
                <div className="flex justify-between">
                    <h2 className="text-sm text-white">Approve Regularization Request</h2>
                    <X className="h-4 w-4 cursor-pointer" onClick={onClose} />
                </div>
                <p className="text-xs -2 text-gray-400">Please add a note before approving the regularization request.</p>

                {/* <div className="mt-4">
                    <p className="text-xs text-gray-300"><strong>Date:</strong> {new Date(timestamp).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-300"><strong>Login Time:</strong> {loginTime}</p>
                    <p className="text-xs text-gray-300"><strong>Logout Time:</strong> {logoutTime}</p>
                    <p className="text-xs text-gray-300"><strong>Remarks:</strong> {remarks}</p>
                </div> */}

                <div className="mt-4">
                    {/* <label className="text-sm text-white">Approval Note</label> */}
                    <textarea
                        value={approvalRemarks}
                        onChange={(e) => setApprovalRemarks(e.target.value)}
                        className="border-gray-600 bg-[#121212] border rounded outline-none px-2 py-2 h-24 w-full text-sm mt-2"
                        placeholder="Add a note before approval (optional)"
                    />
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full text-white hover:bg-[#007A5A] text-sm bg-[#007A5A] py-2 rounded">
                        {loading ? 'Approving...' : 'Approve'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegularizationApprovalModal;
