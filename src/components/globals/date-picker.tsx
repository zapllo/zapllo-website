import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from 'lucide-react';

const CustomDatePicker = ({ selectedDate, onDateChange }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const renderHeader = () => (
        <div className="flex justify-between  items-center mb-4">
            <button onClick={handlePrevMonth}>
                <ChevronLeftCircleIcon className="h-6 w-6" />
            </button>
            <span className="text-2xl font-bold">
                {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={handleNextMonth}>
                <ChevronRightCircleIcon className="h-6 w-6" />
            </button>
        </div>
    );

    const renderDays = () => {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 gap-1 text-lg mb-4">
                {daysOfWeek.map((day) => (
                    <div key={day} className="text-center font-bold">{day}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;
                days.push(
                    <div
                        key={day}
                        className={`text-center text-lg py-2 cursor-pointer ${!isSameMonth(day, monthStart) ? 'text-gray-400' : ''} ${isSameDay(day, selectedDate) ? 'bg-primary rounded text-white' : ''}`}
                        onClick={() => onDateChange(cloneDay)}
                    >
                        <span>{formattedDate}</span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-1" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };

    return (
        <div className="bg- h-96  rounded-lg shadow p-4 w-full">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          
        </div>
    );
};

export default CustomDatePicker;
