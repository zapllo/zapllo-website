'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit2 } from 'lucide-react'; // Assuming you're using lucide-react for icons
import HolidayFormModal from '../modals/EditHoliday'; // Import a component for the modal form

interface Holiday {
    _id: string; // Assuming holidays have an ID fieldh
    holidayName: string;
    holidayDate: string;
}

const HolidayList: React.FC = () => {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store the ID of the holiday being deleted
    const [editHoliday, setEditHoliday] = useState<Holiday | null>(null); // Store the holiday being edited
    const [userRole, setUserRole] = useState<string | null>(null); // Store the user's role

    const fetchHolidays = async () => {
        try {
            const response = await axios.get('/api/holidays');
            setHolidays(response.data.holidays);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching holidays:', error);
            setIsLoading(false);
        }
    };

    const fetchUserRole = async () => {
        try {
            const response = await axios.get('/api/users/me');
            setUserRole(response.data.data.role); // Assuming role is in response.data.data.role
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    };

    const deleteHoliday = async (id: string) => {
        setIsDeleting(id); // Mark this holiday as being deleted
        try {
            await axios.delete(`/api/holidays/${id}`);
            setHolidays(holidays.filter((holiday) => holiday._id !== id)); // Update state after deletion
            setIsDeleting(null);
        } catch (error) {
            console.error('Error deleting holiday:', error);
            setIsDeleting(null);
        }
    };

    const handleEditClick = (holiday: Holiday) => {
        setEditHoliday(holiday); // Open the modal and pass the holiday to be edited
    };

    const handleHolidayUpdated = (updatedHoliday: Holiday) => {
        setHolidays((prevHolidays) =>
            prevHolidays.map((holiday) =>
                holiday._id === updatedHoliday._id ? updatedHoliday : holiday
            )
        );
        setEditHoliday(null); // Close the modal after updating
    };

    useEffect(() => {
        fetchHolidays();
        fetchUserRole(); // Fetch user role
    }, []);

    if (isLoading) {
        return <p>Loading holidays...</p>;
    }

    return (
        <div className="container mx-auto p-6">
            <h3 className="text-sm font-bold mb-4">Upcoming Holidays</h3>
            <table className="w-full rounded table-auto border-collapse border">
                <thead className='bg-[#380e3d] '>
                    <tr>
                        <th className=" px-4 text-xs text-start py-2">Name</th>
                        <th className=" px-4 text-xs text-start py-2">Date</th>
                        {/* Conditionally render Actions column if user is orgAdmin */}
                        {userRole === 'orgAdmin' && <th className=" text-xs text-start px-4 py-2">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {holidays.map((holiday) => (
                        <tr className='border-t' key={holiday._id}>
                            <td className=" px-4 text-xs py-2">{holiday.holidayName}</td>
                            <td className=" px-4 text-xs py-2">
                                {new Date(holiday.holidayDate).toLocaleDateString()}

                            </td>
                            {/* Conditionally render edit and delete buttons if user is orgAdmin */}
                            {userRole === 'orgAdmin' && (
                                <td className=" px-4 py-2">
                                    <button
                                        onClick={() => handleEditClick(holiday)}
                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteHoliday(holiday._id)}
                                        disabled={isDeleting === holiday._id}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        {isDeleting === holiday._id ? 'Deleting...' : <Trash2 className="h-4 w-4" />}
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Render the modal only if an edit holiday is selected */}
            {editHoliday && (
                <HolidayFormModal
                    holiday={editHoliday}
                    onHolidayUpdated={handleHolidayUpdated}
                    onClose={() => setEditHoliday(null)} // Close the modal if canceled
                />
            )}
        </div>
    );
};

export default HolidayList;
