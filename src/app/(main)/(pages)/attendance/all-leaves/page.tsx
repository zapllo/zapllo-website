'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import LeaveApprovalModal from '@/components/modals/leaveApprovalModal'; // Assuming this is the same modal used in the approvals page
import RejectModal from '@/components/modals/rejectModal'; // New reject modal
import EditLeaveBalanceModal from '@/components/modals/editBalanceModal';

type LeaveType = {
    _id: string;
    leaveType: string;
};

type User = {
    _id: string;
    firstName: string;
    lastName: string;
    leaveBalances: LeaveBalance[];
};

type Leave = {
    _id: string;
    user: User;
    leaveType: LeaveType;
    fromDate: string;
    toDate: string;
    appliedDays: number;
    leaveDays: {
        date: string;
        unit: string;
        status: 'Pending' | 'Approved' | 'Rejected';
    }[];
    leaveReason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Partially Approved';
};


type LeaveBalance = {
    leaveType: LeaveType;
    balance: number;
};



export default function AllLeaves() {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [filter, setFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('All');
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null); // For triggering the approval modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // For triggering the reject modal
    const [remarks, setRemarks] = useState<string>(''); // For storing the rejection remarks
    const [tab, setTab] = useState<'applications' | 'balances'>('applications');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (tab === 'balances') {
            fetchLeaveBalances();
        }
    }, [tab]);

    const fetchLeaveBalances = async () => {
        try {
            const response = await axios.get('/api/leaveBalances/get');
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Error fetching leave balances:', error);
        }
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };


    const handleLeaveModalSubmit = async (updatedLeaveBalances: LeaveBalance[]) => {
        if (!selectedUser) return;
        try {
            await axios.post('/api/leaveBalances/update', {
                userIdToUpdate: selectedUser._id,
                leaveBalances: updatedLeaveBalances,
            });
            setIsEditModalOpen(false);
            fetchLeaveBalances(); // Refresh the data
        } catch (error) {
            console.error('Error updating leave balances:', error);
        }
    };


    useEffect(() => {
        const fetchAllLeaves = async () => {
            try {
                const response = await axios.get('/api/leaves/all');
                if (response.data.success) {
                    setLeaves(response.data.leaves);
                }
            } catch (error) {
                console.error('Error fetching leaves:', error);
            }
        };

        fetchAllLeaves();
    }, []);

    const handleApproval = (leave: Leave) => {
        setSelectedLeave(leave);
        setIsModalOpen(true);
    };

    const handleReject = (leave: Leave) => {
        setSelectedLeave(leave);
        setIsRejectModalOpen(true); // Open the reject modal
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleRejectSubmit = async () => {
        if (!remarks) return; // Ensure remarks are entered
        try {
            if (!selectedLeave) return; // Guard against null selectedLeave
            const response = await axios.post(`/api/leaveApprovals/${selectedLeave._id}`, {
                leaveDays: selectedLeave.leaveDays,
                remarks,
                action: 'reject',
            });
            if (response.data.success) {
                // Refetch leaves or update the UI
                const updatedLeaves = await axios.get('/api/leaves/all');
                setLeaves(updatedLeaves.data.leaves);
                setIsRejectModalOpen(false); // Close modal
                setSelectedLeave(null); // Clear selection
                setRemarks(''); // Clear remarks
            }
        } catch (error) {
            console.error('Error rejecting leave:', error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        setIsRejectModalOpen(false); // Close reject modal as well
        setSelectedLeave(null);
    };

    const handleModalSubmit = async () => {
        setIsModalOpen(false);
        setSelectedLeave(null);

        // Refetch leaves after submission to update the status
        const response = await axios.get('/api/leaves/all');
        if (response.data.success) {
            setLeaves(response.data.leaves);
        }
    };

    const filteredLeaves = filter === 'All' ? leaves : leaves.filter(leave => leave.status === filter);

    return (
        <div className="container mx-auto p-6 h-screen overflow-y-scroll">
            <h1 className="text-xl font-bold mb-6">Leave Management</h1>

            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setTab('applications')}
                    className={`px-4 py-2 rounded-md ${tab === 'applications' ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'}`}
                >
                    Leave Applications
                </button>
                <button
                    onClick={() => setTab('balances')}
                    className={`px-4 py-2 rounded-md ${tab === 'balances' ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'}`}
                >
                    Leave Balances
                </button>
            </div>

            {/* Tab Content */}
            {tab === 'applications' ? (
                <div className="container  mx-auto p-6">
                    <h1 className="text-xl font-bold mb-6">All Leaves</h1>

                    {/* Filter Buttons */}
                    <div className="flex space-x-4 mb-6">
                        {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status as 'Pending' | 'Approved' | 'Rejected' | 'All')}
                                className={`px-4 py-2 rounded-md ${filter === status ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Leave Cards */}
                    {filteredLeaves.length === 0 ? (
                        <p className="text-gray-600">No leave requests found.</p>
                    ) : (
                        <div className="space-y-4 ">
                            {filteredLeaves.map((leave) => (
                                <div key={leave._id} className="border p-4 rounded-md shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h2 className="font-bold text-lg">{leave.user.firstName}</h2>
                                            <p className="text-sm text-gray-600">{leave.leaveType.leaveType}</p>
                                        </div>
                                        <span className={`px-4 py-2 rounded-full text-sm ${leave.status === 'Pending' ? 'bg-yellow-500 text-white' :
                                            leave.status === 'Approved' ? 'bg-green-500 text-white' :
                                                leave.status === 'Rejected' ? 'bg-red-500 text-white' :
                                                    leave.status === 'Partially Approved' ? 'bg-blue-500 text-white' :
                                                        'bg-gray-500 text-white'}`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <div>
                                            <p><strong>From:</strong> {format(new Date(leave.fromDate), 'MMM d, yyyy')}</p>
                                            <p><strong>To:</strong> {format(new Date(leave.toDate), 'MMM d, yyyy')}</p>
                                            <p><strong>Applied Days:</strong> {leave.appliedDays}</p>
                                        </div>
                                        {leave.status === 'Pending' && (
                                            <div className="space-x-2">
                                                <button
                                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                                    onClick={() => handleApproval(leave)}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                                    onClick={() => handleReject(leave)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Render the approval modal if selectedLeave is set */}
                    {selectedLeave && isModalOpen && (
                        <LeaveApprovalModal
                            leaveId={selectedLeave._id}
                            leaveDays={selectedLeave.leaveDays}
                            appliedDays={selectedLeave.appliedDays}
                            leaveReason={selectedLeave.leaveReason}
                            onClose={handleModalClose}
                            onSubmit={handleModalSubmit}
                        />
                    )}

                    {/* Render the reject modal if selectedLeave is set */}
                    {selectedLeave && isRejectModalOpen && (
                        <RejectModal
                            entryId={selectedLeave._id}
                            remarks={remarks}
                            setRemarks={setRemarks}
                            onClose={handleModalClose}
                            onSubmit={handleRejectSubmit}
                        />
                    )}
                </div>
            ) : (
                <div>
                    <table className="min-w-full border-collapse table-auto">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">Leave Type</th>
                                <th className="border px-4 py-2">Balance</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td className="border px-4 py-2">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {user.leaveBalances.map(lb => (
                                            <div key={lb.leaveType._id}>{lb.leaveType.leaveType}</div>
                                        ))}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {user.leaveBalances.map(lb => (
                                            <div key={lb.leaveType._id}>{lb.balance}</div>
                                        ))}
                                    </td>
                                    <td className="border px-4 py-2">
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded"
                                            onClick={() => handleEditClick(user)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Render Edit Leave Balance Modal */}
                    {isEditModalOpen && selectedUser && (
                        <EditLeaveBalanceModal
                            user={selectedUser}
                            onClose={handleModalClose}
                            onSubmit={handleLeaveModalSubmit}
                        />
                    )}
                </div>
            )}
        </div>
    );
}