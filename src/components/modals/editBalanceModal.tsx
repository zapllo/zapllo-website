import React, { useState } from 'react';

type LeaveType = {
    _id: string;
    leaveType: string;
};

type LeaveBalance = {
    leaveType: LeaveType;
    balance: number;
};

type User = {
    _id: string;
    firstName: string;
    lastName: string;
    leaveBalances: LeaveBalance[];
};

interface EditLeaveBalanceModalProps {
    user: User;
    onClose: () => void;
    onSubmit: (updatedLeaveBalances: LeaveBalance[]) => void;
}

const EditLeaveBalanceModal: React.FC<EditLeaveBalanceModalProps> = ({ user, onClose, onSubmit }) => {
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(user.leaveBalances);

    const handleBalanceChange = (index: number, newBalance: number) => {
        const updatedBalances = [...leaveBalances];
        updatedBalances[index].balance = newBalance;
        setLeaveBalances(updatedBalances);
    };

    const handleSubmit = () => {
        onSubmit(leaveBalances);
    };

    return (
        <div className="fixed inset-0 bg-black -600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1A1C20] p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Edit Leave Balances for {user.firstName} {user.lastName}</h2>

                <div>
                    {leaveBalances.map((lb, index) => (
                        <div key={lb.leaveType._id} className="mb-4">
                            <label className="block mb-2">{lb.leaveType.leaveType}</label>
                            <input
                                type="number"
                                value={lb.balance}
                                onChange={(e) => handleBalanceChange(index, parseInt(e.target.value))}
                                className="border p-2 w-full"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-2">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditLeaveBalanceModal;
