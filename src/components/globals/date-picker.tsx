import React, { useState } from 'react';
import Select from 'react-select';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay
} from 'date-fns';
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from 'lucide-react';

interface CustomDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(2022, i), 'MMMM')
}));

const yearOptions = Array.from({ length: 20 }, (_, i) => ({
  value: new Date().getFullYear() - 10 + i,
  label: (new Date().getFullYear() - 10 + i).toString()
}));

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleYearChange = (option: any) => {
    const newYear = option.value;
    setSelectedYear(newYear);
    setCurrentMonth(new Date(newYear, selectedMonth));
  };

  const handleMonthChange = (option: any) => {
    const newMonth = option.value;
    setSelectedMonth(newMonth);
    setCurrentMonth(new Date(selectedYear, newMonth));
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={handlePrevMonth}>
        <ChevronLeftCircleIcon className="h-6 w-6" />
      </button>
      <div className="flex items-center space-x-8">
        <Select
          options={monthOptions}
          value={monthOptions.find(option => option.value === selectedMonth)}
          onChange={handleMonthChange}
          className="bg-[#017A5B] w-full text-white"
          classNamePrefix="custom-select"
          styles={{
            option: (provided) => ({
              ...provided,
              backgroundColor: 'black',
              color: 'white'
            }),
            optionHovered: (provided) => ({
              ...provided,
              backgroundColor: '#6B7280', // gray-500
              color: 'white'
            }),
            control: (provided) => ({
              ...provided,
              backgroundColor: '#017A5B',
              border: 'none',
              borderRadius: '0.375rem'
            }),
            singleValue: (provided) => ({
              ...provided,
              color: 'white'
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: '#017A5B',
              borderRadius: '0.375rem'
            }),
          }}
        />
        <Select
          options={yearOptions}
          value={yearOptions.find(option => option.value === selectedYear)}
          onChange={handleYearChange}
          className="bg-[#017A5B] w-full text-white"
          classNamePrefix="custom-select"
          styles={{
            option: (provided) => ({
              ...provided,
              backgroundColor: 'black',
              color: 'white'
            }),
            optionHovered: (provided) => ({
              ...provided,
              backgroundColor: '#6B7280', // gray-500
              color: 'white'
            }),
            control: (provided) => ({
              ...provided,
              backgroundColor: '#017A5B',
              border: 'none',
              borderRadius: '0.375rem'
            }),
            singleValue: (provided) => ({
              ...provided,
              color: 'white'
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: '#017A5B',
              borderRadius: '0.375rem'
            }),
          }}
        />
      </div>
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
            key={day.toString()}
            className={`text-center text-lg py-2 cursor-pointer ${!isSameMonth(day, monthStart) ? 'text-gray-400' : ''} ${isSameDay(day, selectedDate) ? 'bg-[#017A5B] rounded text-white' : ''}`}
            onClick={() => onDateChange(cloneDay)}
          >
            <span>{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-[#1A1D21] h-96 rounded-lg shadow p-4 w-full">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CustomDatePicker;
