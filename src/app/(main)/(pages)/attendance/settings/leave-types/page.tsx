'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Edit2, Info, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import DeleteConfirmationDialog from '@/components/modals/deleteConfirmationDialog';
import Loader from '@/components/ui/loader';

interface LeaveFormData {
    leaveType: string;
    description: string;
    allotedLeaves: number;
    type: 'Paid' | 'Unpaid';
    backdatedLeaveDays: number;
    advanceLeaveDays: number;
    includeHolidays: boolean;
    includeWeekOffs: boolean;
    unit: ('Full Day' | 'Half Day' | 'Short Leave')[]; // Array for multi-selectable units
}

interface LeaveType {
    _id: string;
    leaveType: string;
    allotedLeaves: number;
    description: string;
    type: 'Paid' | 'Unpaid';
    backdatedLeaveDays: number;  // Number of backdated leave days allowed
    advanceLeaveDays: number;    // Number of advance leave days allowed
    includeHolidays: boolean;    // Whether holidays are included in leave calculation
    includeWeekOffs: boolean;    // Whether week-offs are included in leave calculation
    unit: ('Full Day' | 'Half Day' | 'Short Leave')[];  // Array for multi-selectable units
}


const LeaveTypes: React.FC = () => {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]); // State to store leave types
    const [formData, setFormData] = useState<LeaveFormData>({
        leaveType: '',
        description: '',
        allotedLeaves: 0,
        type: 'Paid',
        backdatedLeaveDays: 0,
        advanceLeaveDays: 0,
        includeHolidays: false,
        includeWeekOffs: false,
        unit: [], // Initialize as an empty array
    });

    const [isEdit, setIsEdit] = useState(false); // Flag for edit state
    const [deleteId, setDeleteId] = useState<string | null>(null); // Store ID of leave type to delete
    const [editLeaveId, setEditLeaveId] = useState<string | null>(null); // Store ID of leave type to edit
    const router = useRouter();
    const unitOptions = ['Full Day', 'Half Day', 'Short Leave'] as const; // Define unit options
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Control the modal state
    const [isLoading, setIsLoading] = useState(false);   // Loader for create and edit
    const [isDeleting, setIsDeleting] = useState(false); // Loader for delete
    const [activeTab, setActiveTab] = useState<'All' | 'Paid' | 'Unpaid'>('All'); // State to manage active tab

    const [loading, setLoading] = useState(false);

    const handleUnitToggle = (unit: 'Full Day' | 'Half Day' | 'Short Leave') => {
        setFormData((prevData) => ({
            ...prevData,
            unit: prevData.unit.includes(unit)
                ? prevData.unit.filter((u) => u !== unit) // Remove if already selected
                : [...prevData.unit, unit], // Add if not selected
        }));
    };
    const fetchLeaveTypes = async () => {
        try {
            const response = await axios.get('/api/leaves/leaveType');
            setLeaveTypes(response.data);
        } catch (error) {
            console.error('Error fetching leave types:', error);
        }
    };

    // Fetch leave types when component mounts
    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    const totalAllotedLeaves = leaveTypes.reduce((total, leave) => total + leave.allotedLeaves, 0);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        // Handle checkboxes
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };


    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData({
            ...formData,
            [name]: checked,
        });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isEdit && editLeaveId) {
                // PUT request for editing
                await axios.put(`/api/leaves/leaveType/${editLeaveId}`, formData);
                setLoading(false);
                setIsModalOpen(false);
                fetchLeaveTypes();
            } else {
                // POST request for creating a new leave type
                await axios.post('/api/leaves/leaveType', formData);
                setLoading(false);
                setIsModalOpen(false);
                fetchLeaveTypes();

            }
            router.refresh(); // Refresh after submit
        } catch (error) {
            console.error('Error submitting leave type:', error);
        }
    };

    // Handle edit leave type
    const openEditModal = (leave: LeaveType) => {
        setIsEdit(true);
        setEditLeaveId(leave._id);
        setFormData({
            leaveType: leave.leaveType,
            description: leave.description || '',  // Prefill description
            allotedLeaves: leave.allotedLeaves,
            type: leave.type,
            backdatedLeaveDays: leave.backdatedLeaveDays || 0,  // Prefill backdatedLeaveDays if available
            advanceLeaveDays: leave.advanceLeaveDays || 0,  // Prefill advanceLeaveDays if available
            includeHolidays: leave.includeHolidays || false,  // Prefill includeHolidays
            includeWeekOffs: leave.includeWeekOffs || false,  // Prefill includeWeekOffs
            unit: leave.unit || [],  // Prefill units if available
        });
        setIsModalOpen(true); // Open the modal for editing
    };


    // Handle delete leave type
    const handleDelete = async () => {
        try {
            await axios.delete(`/api/leaves/leaveType/${deleteId}`);
            setIsDeleteDialogOpen(false);
            fetchLeaveTypes(); // Refresh after delete
        } catch (error) {
            console.error('Error deleting leave type:', error);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    // Filter leave types based on the active tab
    const filteredLeaveTypes = leaveTypes.filter((leave) => {
        if (activeTab === 'All') return true;
        return leave.type === activeTab;
    });

    return (
        <div className="container mx-auto p-6">
            {/* Tabs for filtering */}

            {/* Add Leave Type Button */}
            <div className="flex gap-4 justify-center items-center mb-6">
                {/* <h1 className="text-lg font-bold">Leave Types</h1> */}
                <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>

                    <Dialog.Trigger asChild>
                        <button className="bg-[#017A5B] text-white text-xs px-4 py-2 rounded-md" onClick={() => {
                            setIsEdit(false); // Set to add mode
                            setFormData({
                                leaveType: '',
                                description: '',
                                allotedLeaves: 0,
                                type: 'Paid',
                                backdatedLeaveDays: 0,
                                advanceLeaveDays: 0,
                                includeHolidays: false,
                                includeWeekOffs: false,
                                unit: [],
                            });
                        }}>

                            + New Type
                        </button>

                    </Dialog.Trigger>
                    <div className="flex justify-end space-x-3 ">
                        <button
                            className={clsx(
                                'text-xs px-4  h-8 mt-[2px] rounded-md',
                                activeTab === 'All' ? 'bg-[#017A5B] text-white' : 'bg-transparent text-white border-[#505356]  border'
                            )}
                            onClick={() => setActiveTab('All')}
                        >
                            All
                        </button>
                        <button
                            className={clsx(
                                'text-xs px-4  h-8 mt-[2px] rounded-md',
                                activeTab === 'Paid' ? 'bg-[#017A5B] text-white' : 'bg-transparent text-white border-[#505356]  border'
                            )}
                            onClick={() => setActiveTab('Paid')}
                        >
                            Paid
                        </button>
                        <button
                            className={clsx(
                                'text-xs px-4  h-8 mt-[2px]  rounded-md',
                                activeTab === 'Unpaid' ? 'bg-[#017A5B] text-white' : 'bg-transparent text-white border-[#505356]  border'
                            )}
                            onClick={() => setActiveTab('Unpaid')}
                        >
                            Unpaid
                        </button>
                    </div>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 opacity- z-50" />
                        <Dialog.Content className="fixed z-[100]   inset-0 flex items-center justify-center">
                            <div className="b rounded-lg bg-[#1A1C20] shadow-lg w-full max-w-lg p-6">
                                <div className='flex w-full mb-4 justify-between'>
                                    <Dialog.Title className="text-sm font-medium mb-4"> {isEdit ? 'Edit Leave Type' : 'New Leave Type'}</Dialog.Title>
                                    <Dialog.DialogClose className='-mt-4'>X</Dialog.DialogClose>
                                </div>
                                {loading ? <Loader /> : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="absolute bg-[#1A1C20] ml-2 text-xs -mt-2 px-1">Leave Type</label>
                                            <input
                                                type="text"
                                                name="leaveType"
                                                value={formData.leaveType}
                                                onChange={handleInputChange}
                                                // placeholder='Leave Type'
                                                className="w-full text-sm p-2 outline-none border rounded bg-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            {/* <label className="block text-sm">Description</label> */}
                                            <label className="absolute bg-[#1A1C20] ml-2 text-xs -mt-2 px-1">Description</label>

                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                // placeholder='Description'
                                                className="w-full text-sm p-2 border bg-transparent outline-none rounded"
                                                required
                                            />
                                        </div>

                                        <div>
                                            {/* <label className="block text-sm">Allotted Leaves</label> */}
                                            <label className="absolute bg-[#1A1C20] ml-2 text-xs -mt-2 px-1">Alloted Leaves</label>
                                            <input
                                                type="number"
                                                name="allotedLeaves"
                                                value={formData.allotedLeaves}
                                                onChange={handleInputChange}
                                                placeholder='Alloted Leaves'
                                                className="w-full text-sm p-2 border outline-none bg-transparent rounded"
                                                required
                                            />
                                        </div>

                                        <div className="flex space-x-4">
                                            <div className='flex gap-4'>
                                                <label className="block text-sm mt-2 ">Type</label>
                                                <div className="flex space-x-4">
                                                    <button
                                                        type="button"
                                                        className={clsx(
                                                            'px-4 py-1 text-xs h-8 mt-1 rounded  border border-[#505356]    cursor-pointer',
                                                            formData.type === 'Paid' ? 'bg-[#017A5B] text-white' : 'bg-transparent  border border-[#505356] '
                                                        )}
                                                        onClick={() => setFormData({ ...formData, type: 'Paid' })}
                                                    >
                                                        Paid
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={clsx(
                                                            'px-4 py-1 text-xs h-8 mt-1 rounded  border border-[#505356]    cursor-pointer',
                                                            formData.type === 'Unpaid' ? 'bg-[#017A5B] text-white' : 'bg-transparent  border border-[#505356] '
                                                        )}
                                                        onClick={() => setFormData({ ...formData, type: 'Unpaid' })}
                                                    >
                                                        Unpaid
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex  gap-8">
                                            <div className='flex w-full gap-2  bg-[#282D32] p-2  rounded'>
                                                <label className="block text-sm  ">Backdated Leave Days</label>
                                                <input
                                                    type="number"
                                                    name="backdatedLeaveDays"
                                                    value={formData.backdatedLeaveDays}
                                                    onChange={handleInputChange}
                                                    className=" border border-[#505356] px-4 py-2 w-24 outline-none bg-transparent rounded-md"
                                                />
                                            </div>
                                            <div className='flex gap-2 w-full bg-[#282D32] p-2 rounded'>
                                                <label className="block text-sm w-1/2 ">Advance Leave Days</label>
                                                <input
                                                    type="number"
                                                    name="advanceLeaveDays"
                                                    value={formData.advanceLeaveDays}
                                                    onChange={handleInputChange}
                                                    className=" border border-[#505356] px-4 w-24 outline-none bg-transparent rounded-md"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between w-full ">
                                            <div className='flex gap-2 px-2'>
                                                <label className="block text-sm mb-2">Include Holidays</label>
                                                <Switch
                                                    checked={formData.includeHolidays}
                                                    onCheckedChange={(checked) => handleSwitchChange('includeHolidays', checked)}
                                                    id="includeHolidays"
                                                />
                                            </div>

                                            <div className='flex gap-2 px-2'>
                                                <label className="block text-sm mb-2">Include Week Offs</label>
                                                <Switch
                                                    checked={formData.includeWeekOffs}
                                                    onCheckedChange={(checked) => handleSwitchChange('includeWeekOffs', checked)}
                                                    id="includeWeekOffs"
                                                />
                                            </div>
                                        </div>
                                        <div className='bg-[#282D32] p-2 rounded'>
                                            <div className='flex gap-2 bg-[#282D32]  rounded'>
                                                <div className='flex gap-2'>
                                                    <label className="block text-sm mt-1">Unit</label>
                                                    <div className="flex space-x-4">
                                                        {unitOptions.map((unit) => (
                                                            <button
                                                                key={unit}
                                                                type="button"
                                                                className={clsx(
                                                                    'px-4 py-2 text-xs rounded',
                                                                    formData.unit.includes(unit)
                                                                        ? 'bg-[#017A5B] text-white'
                                                                        : 'bg-transparent border border-[#505356]  '
                                                                )}
                                                                onClick={() => handleUnitToggle(unit)}
                                                            >
                                                                {unit}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mt-3 flex gap-1'>
                                                <Info className='h-5' />
                                                <p className=' text-sm '>Deduction (in Days) : Full Day - 1, Half Day - 0.5, Short Leave - 0.25 </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="submit" className="bg-[#017A5B] w-full text-sm text-white px-4 py-2 rounded">
                                                {isEdit ? 'Update Leave Type' : 'Add Leave Type'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
            {leaveTypes.length === 0 ? (
                <div className="text-center">
                    {/* <h2 className="text-xl font-semibold">No Leave Types Found</h2> */}
                    <button
                        className="mt-2 bg-[#017A5B] text-white text-xs px-4 py-2 rounded-md"
                        onClick={() => {
                            // Logic for creating recommended leave types can go here
                            console.log("Creating recommended leave types");
                        }}
                    >
                        +  Create Recommended Leave Types
                    </button>
                </div>
            ) : (
                <>
                    <h1 className='text-center'>Total Leaves Alloted: {totalAllotedLeaves}</h1>
                </>
            )}
            <div>
            </div>
            {/* Leave Types Grid */}
            {leaveTypes.length === 0 ? (
                <div className=''>
                    <div className='flex w-full justify-center'>
                        <img src='/animations/not found.gif' className='h-48 ' />
                    </div>
                    <h1 className='text-center  text-sm mt-6'>No Leave Types Found</h1>
                    <p className='text-center text-xs'>Click on New Leave type to create a leave type</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                    {filteredLeaveTypes.map((leave) => (
                        <div key={leave._id} className="border shadow-md rounded-lg p-4 flex flex-col justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">{leave.leaveType}</h2>
                                <span className={clsx(
                                    'inline-block px-2 py-1 text-xs font-medium rounded mt-2',
                                    leave.type === 'Paid' ? 'bg-[#017A5B] text-white -800' : 'bg-[#75517B] text-white'
                                )}>
                                    {leave.type}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm">Leaves Allotted: <strong>{leave.allotedLeaves}</strong></p>
                                <div className="mt-2 flex  justify-end gap-2">
                                    <button className="text-gray-600 hover:text-gray-800">
                                        <Edit2 onClick={() => openEditModal(leave)} className='h-5 text-blue-400' />
                                    </button>
                                    <button className="text-gray-600 hover:text-red-600">
                                        <Trash2 onClick={() => handleDeleteClick(leave._id)} className='h-5 text-red-500' />
                                    </button>
                                </div>
                                {loading ? <Loader /> : (
                                    <DeleteConfirmationDialog
                                        isOpen={isDeleteDialogOpen}
                                        onClose={() => setIsDeleteDialogOpen(false)}
                                        onConfirm={handleDelete}
                                        title="Delete Leave Type"
                                        description="Are you sure you want to delete this leave type? This action cannot be undone."
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div >
    );
};

export default LeaveTypes;