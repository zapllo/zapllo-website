// pages/approvals.tsx

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import LeaveApprovalModal from '@/components/modals/leaveApprovalModal';
import RejectModal from '@/components/modals/rejectModal';
import RegularizationApprovalModal from '@/components/modals/regularizationApprovalModal';
import RegularizationRejectModal from '@/components/modals/rejectRegularizationModal';

type LeaveType = {
    _id: string;
    leaveType: string;
};

type User = {
    _id: string;
    firstName: string;
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

type Regularization = {
    _id: string;
    user: User;
    action: 'regularization';
    timestamp: string;
    loginTime: string;
    logoutTime: string;
    remarks: string;
    approvalStatus: 'Pending' | 'Approved' | 'Rejected';
    approvalRemarks?: string;
    approvedBy?: string;
    approvedAt?: string;
};

// Type Guard to check if an entry is Regularization
function isRegularization(entry: Leave | Regularization): entry is Regularization {
    return (entry as Regularization).action === 'regularization';
}

export default function Approvals() {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [regularizations, setRegularizations] = useState<Regularization[]>([]);
    const [filter, setFilter] = useState<'Leave' | 'Regularization'>('Leave'); // New filter state
    const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('All');
    const [selectedEntry, setSelectedEntry] = useState<Leave | Regularization | null>(null); // For triggering the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // For triggering the reject modal
    const [remarks, setRemarks] = useState<string>(''); // For storing the rejection remarks

    useEffect(() => {
        const fetchApprovals = async () => {
            try {
                if (filter === 'Leave') {
                    const response = await axios.get('/api/leaveApprovals/get');
                    if (response.data.success) {
                        setLeaves(response.data.leaves);
                    }
                } else if (filter === 'Regularization') {
                    const response = await axios.get('/api/regularization-approvals');
                    if (response.data.success) {
                        setRegularizations(response.data.regularizations);
                    }
                }
            } catch (error: any) {
                console.error(`Error fetching ${filter} approvals:`, error.response?.data || error.message);
                alert(`Failed to fetch ${filter} approvals: ${error.response?.data?.message || error.message}`);
            }
        };

        fetchApprovals();
    }, [filter]);

    console.log(leaves, 'leaves?');
    console.log(regularizations, 'regularizations?');

    const handleApproval = (entry: Leave | Regularization) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
    };

    const handleReject = (entry: Leave | Regularization) => {
        setSelectedEntry(entry);
        setIsRejectModalOpen(true); // Open the reject modal
    };

    const handleRejectSubmit = async () => {
        if (!remarks) {
            alert('Please enter remarks for rejection.');
            return;
        }
        try {
            if (!selectedEntry) return; // Guard against null selectedEntry

            if (!isRegularization(selectedEntry)) {
                // It's a Leave
                const leave = selectedEntry as Leave;
                const response = await axios.post(`/api/leaveApprovals/${leave._id}`, {
                    leaveDays: leave.leaveDays,
                    remarks,
                    action: 'reject',
                });
                if (response.data.success) {
                    // Refetch leaves
                    const updatedLeaves = await axios.get('/api/leaveApprovals/get');
                    setLeaves(updatedLeaves.data.leaves);
                    setIsRejectModalOpen(false); // Close modal
                    setSelectedEntry(null); // Clear selection
                    setRemarks(''); // Clear remarks
                } else {
                    throw new Error(response.data.message || 'Failed to reject leave request.');
                }
            } else {
                // It's a Regularization
                const regularization = selectedEntry as Regularization;
                const response = await axios.patch(`/api/regularization-approvals/${regularization._id}`, {
                    action: 'reject',
                    notes: remarks,
                });
                if (response.data.success) {
                    // Refetch regularizations
                    const updatedRegularizations = await axios.get('/api/regularization-approvals');
                    setRegularizations(updatedRegularizations.data.regularizations);
                    setIsRejectModalOpen(false); // Close modal
                    setSelectedEntry(null); // Clear selection
                    setRemarks(''); // Clear remarks
                } else {
                    throw new Error(response.data.message || 'Failed to reject regularization request.');
                }
            }
        } catch (error: any) {
            console.error('Error rejecting entry:', error.response?.data || error.message);
            alert(error.message || 'An error occurred while rejecting the entry.');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsRejectModalOpen(false); // Close reject modal as well
        setSelectedEntry(null);
        setRemarks('');
    };

    // Counts for tabs and statuses
    const leaveCount = leaves.length;
    const regularizationCount = regularizations.length;
    const pendingLeaveCount = leaves.filter(leave => leave.status === 'Pending').length;
    const approvedLeaveCount = leaves.filter(leave => leave.status === 'Approved').length;
    const rejectedLeaveCount = leaves.filter(leave => leave.status === 'Rejected').length;

    const pendingRegCount = regularizations.filter(reg => reg.approvalStatus === 'Pending').length;
    const approvedRegCount = regularizations.filter(reg => reg.approvalStatus === 'Approved').length;
    const rejectedRegCount = regularizations.filter(reg => reg.approvalStatus === 'Rejected').length;

    const handleModalSubmit = async () => {
        setIsModalOpen(false);
        setSelectedEntry(null);
        // Refetch data based on the current filter
        try {
            if (filter === 'Leave') {
                const response = await axios.get('/api/leaveApprovals/get');
                if (response.data.success) {
                    setLeaves(response.data.leaves);
                }
            } else if (filter === 'Regularization') {
                const response = await axios.get('/api/regularization-approvals');
                if (response.data.success) {
                    setRegularizations(response.data.regularizations);
                }
            }
        } catch (error: any) {
            console.error(`Error refetching ${filter} approvals:`, error.response?.data || error.message);
        }
    };

    const filteredLeaves = statusFilter === 'All' ? leaves : leaves.filter(leave => leave.status === statusFilter);
    const filteredRegularizations = statusFilter === 'All' ? regularizations : regularizations.filter(reg => reg.approvalStatus === statusFilter);

    return (
        <div className="container mx-auto p-6">
            {/* <h1 className="text-2xl font-bold mb-6">Approvals</h1> */}

            {/* Filter Buttons */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setFilter('Leave')}
                    className={`px-4 text-xs h-8 rounded ${filter === 'Leave' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                >
                    Leave
                </button>
                <button
                    onClick={() => setFilter('Regularization')}
                    className={`px-4 text-xs h-8 rounded ${filter === 'Regularization' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                >
                    Regularization
                </button>
            </div>
            {/* Status Filter Buttons with Counts */}
            <div className="flex justify-center gap-4 mb-6">
                {filter === 'Leave' ? (
                    <>
                        <button
                            onClick={() => setStatusFilter('All')}
                            className={`px-4 text-xs h-8 rounded ${statusFilter === 'All' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                        >
                            All ({leaveCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('Pending')}
                            className={`px-4 text-xs h-8 rounded ${statusFilter === 'Pending' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                        >
                            Pending ({pendingLeaveCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('Approved')}
                            className={`px-4 text-xs h-8 rounded  ${statusFilter === 'Approved' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                        >
                            Approved ({approvedLeaveCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('Rejected')}
                            className={`px-4 text-xs h-8 rounded ${statusFilter === 'Rejected' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                        >
                            Rejected ({rejectedLeaveCount})
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setStatusFilter('All')}
                            className={`px-4 text-xs h-8 rounded ${statusFilter === 'All' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                        >
                            All ({regularizationCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('Pending')}
                            className={`px-4 text-xs h-8 rounded ${statusFilter === 'Pending' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                        >
                            Pending ({pendingRegCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('Approved')}
                            className={`px-4 text-xs h-8 rounded ${statusFilter === 'Approved' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                        >
                            Approved ({approvedRegCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('Rejected')}
                            className={`px-4 text-xs h-8 rounded ${statusFilter === 'Rejected' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
                        >
                            Rejected ({rejectedRegCount})
                        </button>
                    </>
                )}
            </div>


            {/* Entries Display */}
            {filter === 'Leave' ? (
                <>
                    {filteredLeaves.length === 0 ? (
                        <p className="text-gray-600">No leave requests found.</p>
                    ) : (
                        <div className="space-y-4">
                            {filteredLeaves.map((leave) => (
                                <div key={leave._id} className="flex items-center justify-between border p-4 rounded shadow-sm mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-6 w-6 rounded-full bg-[#7c3987] flex items-center justify-center text-white text-sm">
                                            {leave.user.firstName[0]}
                                        </div>
                                        <h3 className="text-md text-white">{leave.user.firstName}</h3>
                                        <p className="text-sm text-white">
                                            From: <span className="text-white">{format(new Date(leave.fromDate), 'MMM d, yyyy')}</span>
                                            <span className="ml-4">To: <span className="text-white">{format(new Date(leave.toDate), 'MMM d, yyyy')}</span></span>
                                        </p>
                                    </div>

                                    <span className={`px-3 py-1 rounded-full text-sm ${leave.status === 'Pending' ? 'bg-yellow-500 text-white' :
                                        leave.status === 'Approved' ? 'bg-green-500 text-white' :
                                            leave.status === 'Rejected' ? 'bg-red-500 text-white' :
                                                'bg-gray-500 text-white'}`}>
                                        {leave.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {filteredRegularizations.length === 0 ? (
                        <p className="text-gray-600">No regularization requests found.</p>
                    ) : (
                        <div className="space-y-4">
                            {filteredRegularizations.map((reg) => (
                                <div key={reg._id} className="flex items-center justify-between border p-4 rounded shadow-sm mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-6 w-6 rounded-full bg-[#7c3987] flex items-center justify-center text-white text-sm">
                                            {reg.user.firstName[0]}
                                        </div>
                                        <h3 className="text-md text-white">{reg.user.firstName}</h3>
                                        <p className="text-sm text-white">
                                            Date: <span className="text-white">{format(new Date(reg.timestamp), 'MMM d, yyyy')}</span>
                                        </p>
                                    </div>

                                    <span className={`px-3 py-1 rounded-full text-sm ${reg.approvalStatus === 'Pending' ? 'bg-yellow-500 text-white' :
                                        reg.approvalStatus === 'Approved' ? 'bg-green-500 text-white' :
                                            reg.approvalStatus === 'Rejected' ? 'bg-red-500 text-white' :
                                                'bg-gray-500 text-white'}`}>
                                        {reg.approvalStatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Render the approval modal */}
            {selectedEntry && isModalOpen && (
                <>
                    {!isRegularization(selectedEntry) ? (
                        <LeaveApprovalModal
                            leaveId={(selectedEntry as Leave)._id}
                            leaveDays={(selectedEntry as Leave).leaveDays}
                            appliedDays={(selectedEntry as Leave).appliedDays}
                            leaveReason={(selectedEntry as Leave).leaveReason}
                            onClose={handleModalClose}
                            onSubmit={handleModalSubmit}
                        />
                    ) : (
                        <RegularizationApprovalModal
                            regularizationId={(selectedEntry as Regularization)._id}
                            timestamp={(selectedEntry as Regularization).timestamp}
                            loginTime={(selectedEntry as Regularization).loginTime}
                            logoutTime={(selectedEntry as Regularization).logoutTime}
                            remarks={(selectedEntry as Regularization).remarks}
                            onClose={handleModalClose}
                            onSubmit={handleModalSubmit}
                        />
                    )}
                </>
            )}

            {/* Render the reject modal */}
            {selectedEntry && isRejectModalOpen && (
                <>
                    {!isRegularization(selectedEntry) ? (
                        <RejectModal
                            entryId={selectedEntry._id}
                            remarks={remarks}
                            setRemarks={setRemarks}
                            onClose={handleModalClose}
                            onSubmit={handleRejectSubmit}
                        />
                    ) : (
                        <RegularizationRejectModal
                            regularizationId={selectedEntry._id}
                            remarks={remarks}
                            setRemarks={setRemarks}
                            onClose={handleModalClose}
                            onSubmit={handleRejectSubmit}
                        />
                    )}
                </>
            )}
        </div>
    );
}