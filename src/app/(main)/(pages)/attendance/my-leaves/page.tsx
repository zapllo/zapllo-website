'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import MyLeaveForm from '@/components/forms/MyLeavesForm'; // Your form component

interface LeaveType {
    allotedLeaves: ReactNode;
    _id: string;
    leaveType: string; // Assuming this is the correct structure from the response
}

// Update the Leave interface to include leaveType as an object and appliedDays
interface Leave {
    _id: string;
    leaveType: LeaveType; // leaveType is an object
    fromDate: string;
    toDate: string;
    status: string;
    appliedDays: number; // Add appliedDays field
}

interface LeaveDetails {
    totalAllotedLeaves: number;
    userLeaveBalance: number;
}

const MyLeaves: React.FC = () => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leaveDetails, setLeaveDetails] = useState<{ [key: string]: LeaveDetails }>({});

    // Fetch the leave types for the organization
    const fetchLeaveTypes = async () => {
        try {
            const response = await axios.get('/api/leaves/leaveType');
            setLeaveTypes(response.data);
        } catch (error) {
            console.error('Error fetching leave types:', error);
        }
    };

    // Fetch the user-specific leave details (balance, etc.) based on leave types
    const fetchLeaveDetails = async (leaveTypes: LeaveType[]) => {
        try {
            const leaveDetailsMap: { [key: string]: LeaveDetails } = {};

            for (const leaveType of leaveTypes) {
                const response = await axios.get(`/api/leaves/${leaveType._id}`);
                console.log(response.data, `Details for leaveTypeId: ${leaveType._id}`); // Check the response data here

                if (response.data.success) {
                    leaveDetailsMap[leaveType._id] = {
                        totalAllotedLeaves: response.data.data.allotedLeaves,
                        userLeaveBalance: response.data.data.userLeaveBalance,
                    };
                } else {
                    leaveDetailsMap[leaveType._id] = {
                        totalAllotedLeaves: 0,
                        userLeaveBalance: 0,
                    };
                }
            }

            setLeaveDetails(leaveDetailsMap); // Set leave details state after fetching all leave types
        } catch (error) {
            console.error('Error fetching leave details:', error);
        }
    };

    // Fetch the leaves of the logged-in user
    const fetchUserLeaves = async () => {
        try {
            const response = await axios.get('/api/leaves');
            if (response.data.success) {
                console.log('Leaves fetched:', response.data.leaves); // Add logging
                setLeaves(response.data.leaves);
            } else {
                console.error('Error: No leaves found');
            }
        } catch (error) {
            console.error('Error fetching user leaves:', error);
        }
    };

    console.log(leaves, 'leaves???')

    useEffect(() => {
        fetchUserLeaves();
    }, []);

    // Fetch leave types first, and then fetch the corresponding leave details
    useEffect(() => {
        const fetchInitialData = async () => {
            await fetchLeaveTypes();
        };

        fetchInitialData();
    }, []);

    // Fetch leave details when leaveTypes is populated
    useEffect(() => {
        if (leaveTypes.length > 0) {
            fetchLeaveDetails(leaveTypes);
        }
    }, [leaveTypes]); // This ensures that leave details are fetched only after leaveTypes is updated


    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchUserLeaves(); // Refetch user leaves after applying a new one
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-xl font-semibold mb-4">My Leaves</h1>

            {/* Button to trigger the modal for applying leave */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Apply Leave
                    </button>
                </DialogTrigger>

                <DialogContent>
                    <DialogTitle> Apply for Leave</DialogTitle>
                    <DialogDescription>
                        Select leave type and details to apply for leave.
                    </DialogDescription>
                    {/* Render the form in the modal */}
                    <MyLeaveForm leaveTypes={leaveTypes} onClose={handleModalClose} />
                </DialogContent>
            </Dialog >
            <div className="grid grid-cols-6 gap-4">
                {leaveTypes.map((leaveType) => (
                    <div key={leaveType._id} className="border p-4">
                        <h1>{leaveType.leaveType}</h1>
                        <div className='flex justify-between gap-2 mt-2'>
                            <h1>{leaveType.allotedLeaves}</h1>

                            {/* Fetch leave details from leaveDetails map using the leaveType._id */}
                            {leaveDetails[leaveType._id] ? (
                                <div className="">
                                    <p>Remaining Balance: {leaveDetails[leaveType._id].userLeaveBalance}</p>
                                </div>
                            ) : (
                                <div>Loading...</div> // Add a loading state if needed
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Display existing leaves */}
            <div className="mt-6">
                <h2 className="text-lg font-semibold">Your Leaves</h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {Array.isArray(leaves) && leaves.map((leave) => (
                        <div key={leave._id} className="border p-4 rounded shadow-sm ">
                            {leave.leaveType ? (
                                <>
                                    <h3 className="font-semibold text-lg">{leave.leaveType.leaveType}</h3>
                                    <p>From: {new Date(leave.fromDate).toLocaleDateString()}</p>
                                    <p>To: {new Date(leave.toDate).toLocaleDateString()}</p>
                                    <p>Status: {leave.status}</p>
                                    <p>Applied Days: {leave.appliedDays}</p>
                                </>
                            ) : (
                                <p className="text-red-500">Error: Missing leave type data</p>
                            )}
                        </div>
                    ))}
                </div>
            </div >
        </div >
    );
};

export default MyLeaves;
