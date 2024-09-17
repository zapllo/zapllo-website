'use client'

// components/HolidayForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface HolidayFormProps {
    onHolidayCreated: () => void; // Callback to trigger after a holiday is created
}

const HolidayForm: React.FC<HolidayFormProps> = ({ onHolidayCreated }) => {
    const [holidayName, setHolidayName] = useState('');
    const [holidayDate, setHolidayDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!holidayName || !holidayDate) {
            alert('Please fill all the fields');
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
            setHolidayDate('');
            setIsSubmitting(false);
            alert('Holiday added successfully');

            // Callback after creation
            onHolidayCreated();
        } catch (error) {
            console.error('Error creating holiday:', error);
            alert('Failed to add holiday');
            setIsSubmitting(false);
        }
    };

    return (
        <div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label className='absolute text-xs -mt-[8px] bg-[#1A1C20] ml-1'>Holiday Name</label>
                    <input
                        type="text"
                        value={holidayName}
                        onChange={(e) => setHolidayName(e.target.value)}
                        required
                        className='p-2 px-2 outline-none w-full'
                    />
                </div>

                <div>
                    {/* <label>Holiday Date</label> */}
                    <label className='absolute text-xs mt-2 bg-[#1A1C20] ml-1'>Holiday Date</label>

                    <input
                        type="date"
                        value={holidayDate}
                        onChange={(e) => setHolidayDate(e.target.value)}
                        required
                        className='mt-4 p-2 outline-none w-full'
                    />
                </div>
                <div className='w-full flex justify-center'>
                    <button type="submit" className='bg-[#017A5B] px-4 mt-4 py-2 text-sm rounded' disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Holiday'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HolidayForm;
