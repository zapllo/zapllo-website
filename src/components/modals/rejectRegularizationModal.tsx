// components/modals/RegularizationRejectModal.tsx

'use client';

import React from 'react';

interface RegularizationRejectModalProps {
    regularizationId: string;
    remarks: string;
    setRemarks: (remarks: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}

const RegularizationRejectModal: React.FC<RegularizationRejectModalProps> = ({
    regularizationId,
    remarks,
    setRemarks,
    onClose,
    onSubmit
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1A1C20] p-6 rounded-md w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-white">Reject Regularization</h2>
                <p>Are you sure you want to reject this regularization?</p>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter remarks..."
                    className="w-full mt-4 p-2 outline-none border rounded-md bg-gray-800 text-white"
                />
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                    <button onClick={onSubmit} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
                </div>
            </div>
        </div>
    );
};

export default RegularizationRejectModal;
