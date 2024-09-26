'use client'

// components/HolidayForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import CustomDatePicker from '../globals/date-picker';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { toast, Toaster } from 'sonner';

interface HolidayFormProps {
    onHolidayCreated: () => void; // Callback to trigger after a holiday is created
}

const HolidayForm: React.FC<HolidayFormProps> = ({ onHolidayCreated }) => {
    const [holidayName, setHolidayName] = useState('');
    const [holidayDate, setHolidayDate] = useState<string | null>(null); // Change to string or null to handle the custom date
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // To handle the date picker dialog

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!holidayName || !holidayDate) {
            toast.error('Please fill all the fields');
            return;
        }

        setIsSubmitting(true);

        try {
            // Send request to create holiday
            await axios.post('/api/holidays', {
                holidayName,
                holidayDate,
            });

            // Reset form
            setHolidayName('');
            setHolidayDate(null); // Reset holiday date
            setIsSubmitting(false);
            toast.success('Holiday added successfully');

            // Callback after creation
            onHolidayCreated();
        } catch (error) {
            console.error('Error creating holiday:', error);
            toast.error('Failed to add holiday');
            setIsSubmitting(false);
        }
    };

    // Function to format the date to a readable format (e.g., "20 Sep 2023")
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'Select Date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div>
            <Toaster />
            <form onSubmit={handleSubmit}>
                <div>
                    <label className='absolute text-xs -mt-[8px] bg-[#1A1C20] ml-1'>Holiday Name</label>
                    <input
                        type="text"
                        value={holidayName}
                        onChange={(e) => setHolidayName(e.target.value)}
                        required
                        className='p-2 px-2 text-xs outline-none w-full'
                    />
                </div>

                <div className='mt-4'>
                    <label className='absolute text-xs -mt-2 bg-[#1A1C20] ml-1'>Holiday Date</label>

                    {/* Date Picker Button */}
                    <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(true)}
                                className="rounded bg-black hover:bg-black px-3 flex gap-1 py-2 mt-4 w-full"
                            >
                                {holidayDate ? (
                                    // Show the selected date if a date has been picked
                                    <h1 className='text-xs'>{holidayDate}</h1>
                                ) : (
                                    <h1 className="text-xs">Select Date</h1>
                                )}
                            </button>
                        </DialogTrigger>
                        <DialogContent className="">
                            <div className="absolute z-[100] inset-0 bg-black -900 bg-opacity-50 rounded-xl flex justify-center items-center">
                                <div
                                    className="bg-[#1A1C20] z-[100] h-[510px] max-h-screen scale-75 text-[#D0D3D3] w-[100%] rounded-lg p-8">
                                    <CustomDatePicker
                                        selectedDate={holidayDate ? new Date(holidayDate) : null}
                                        onDateChange={(newDate) => {
                                            const localDate = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
                                                .toISOString()
                                                .split('T')[0];
                                            setHolidayDate(localDate);
                                            setIsDatePickerOpen(false); // Close the picker after selecting the date
                                        }}
                                        onCloseDialog={() => setIsDatePickerOpen(false)}
                                    />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className='w-full flex justify-center'>
                    <button type="submit" className='bg-[#017A5B] px-4 mt-4 py-2 text-sm rounded' disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Holiday'}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default HolidayForm;
