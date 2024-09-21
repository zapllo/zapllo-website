// pages/holidayManager.tsx
'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import HolidayForm from '@/components/forms/HolidayForm'; // Ensure you have this component to create holidays
import HolidayList from '@/components/lists/HolidayList'; // Ensure you have this component to display holidays

const HolidayManager: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Control the modal state

    const handleHolidayCreated = () => {
        setIsModalOpen(false); // Close modal after holiday is created
        window.location.reload(); // Refresh the page to fetch the updated holiday list
    };

    return (
        <div className="container mx-auto p-6">
            {/* <h2 className="text-lg font-bold mb-6">Holiday Manager</h2> */}

            {/* Dialog Root */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <div className='flex ml-6a'>
                    <Dialog.Trigger asChild>
                        <button
                            className="bg-[#017A5B] text-white text-xs px-4 py-2 rounded-md flex items-center gap-2"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> Add New Holiday
                        </button>
                    </Dialog.Trigger>
                </div>

                {/* Modal Content */}
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                    <Dialog.Content className="fixed z-[100] inset-0 flex items-center justify-center">
                        <div className="bg-[#1A1C20] rounded-lg shadow-lg p-6 w-full max-w-lg">
                            <div className="flex justify-between mb-4">
                                <Dialog.Title className="text-sm font-medium">Add New Holiday</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="text-white text-sm">X</button>
                                </Dialog.Close>
                            </div>

                            <HolidayForm onHolidayCreated={handleHolidayCreated} /> {/* Holiday Form Component */}

                            <div className="flex justify-end mt-4">

                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Holiday List */}
            <div className="mt-6">
                <HolidayList /> {/* Holiday List Component to display holidays */}
            </div>
        </div>
    );
};

export default HolidayManager;
