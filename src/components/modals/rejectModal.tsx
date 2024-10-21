import React from 'react';

interface RejectModalProps {
    entryId: string;
    remarks: string;
    setRemarks: (remarks: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ entryId, remarks, setRemarks, onClose, onSubmit }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0b0d29]  p-6 rounded-md w-full max-w-md">
                <div className='flex justify-between'>
                    <h2 className="text-md font-medium  text-white">Reject Leave</h2>
                    <button onClick={onClose} className="text-xs ">X</button>
                </div>
                <p className='text-xs mt-2'>Are you sure you want to reject this leave?</p>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter remarks..."
                    className="w-full mt-4 p-2 text-xs bg-[#121212] outline-none border rounded-md"
                />
                <div className="flex justify-end space-x-2 mt-6">
                    {/* <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button> */}
                    <button onClick={onSubmit} className="bg-red-500 text-xs w-full text-white px-4 py-2 rounded">Reject</button>
                </div>
            </div>
        </div>
    );
};

export default RejectModal;
