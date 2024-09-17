'use client'
// components/HolidayFormModal.tsx
import React, { useState } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';

interface Holiday {
    _id: string;
    holidayName: string;
    holidayDate: string;
}

interface HolidayFormModalProps {
    holiday: Holiday;
    onHolidayUpdated: (updatedHoliday: Holiday) => void;
    onClose: () => void;
}

const HolidayFormModal: React.FC<HolidayFormModalProps> = ({ holiday, onHolidayUpdated, onClose }) => {
    const [holidayName, setHolidayName] = useState(holiday.holidayName);
    const [holidayDate, setHolidayDate] = useState(holiday.holidayDate);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.put(`/api/holidays/${holiday._id}`, {
                holidayName,
                holidayDate,
            });
            onHolidayUpdated(response.data.holiday);
            setIsLoading(false);
        } catch (error) {
            console.error('Error updating holiday:', error);
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed z-[100] inset-0 flex items-center justify-center">
                    <form onSubmit={handleSubmit} className="bg-[#1A1C20] rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between mb-4">
                            <Dialog.Title className="text-sm font-medium">Edit Holiday</Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="text-white text-sm">X</button>
                            </Dialog.Close>
                        </div>

                        <div>
                            <label className="absolute text-xs -mt-[8px] bg-[#1A1C20] ml-1">Holiday Name</label>
                            <input
                                type="text"
                                value={holidayName}
                                onChange={(e) => setHolidayName(e.target.value)}
                                className='p-2 px-2 text-sm outline-none w-full rounded'
                                required
                            />
                        </div>
                        <div>
                            <label className='absolute text-xs mt-2 bg-[#1A1C20] ml-1'>Holiday Date</label>
                            <input
                                type="date"
                                value={holidayDate.split('T')[0]} // Ensure correct date format
                                onChange={(e) => setHolidayDate(e.target.value)}
                                className='mt-4 p-2 outline-none rounded w-full'
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-2">

                            <button type="submit" className='bg-[#017A5B] px-4 mt-4 py-2 text-sm rounded' disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default HolidayFormModal;
