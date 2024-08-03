'use client'

import React, { useState, useEffect } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { motion } from 'framer-motion';
import { KeyboardIcon } from 'lucide-react';

interface CustomTimePickerProps {
  selectedTime: string | null;
  onTimeChange: (time: string) => void;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ selectedTime, onTimeChange }) => {
  const [isClockVisible, setIsClockVisible] = useState(true);
  const [clockTime, setClockTime] = useState(new Date());

  useEffect(() => {
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const updatedTime = new Date(clockTime);
      updatedTime.setHours(hours);
      updatedTime.setMinutes(minutes);
      setClockTime(updatedTime);
    } else {
      // Set default time to 12:00 if selectedTime is not provided
      const defaultTime = new Date();
      defaultTime.setHours(12);
      defaultTime.setMinutes(0);
      setClockTime(defaultTime);
      onTimeChange('12:00'); // Ensure the time input is also set to default
    }
  }, [selectedTime, clockTime, onTimeChange]);

  const toggleClockVisibility = () => {
    setIsClockVisible(!isClockVisible);
  };

  const handleClockChange = (time: Date) => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    setClockTime(time);
    onTimeChange(formattedTime);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange(event.target.value);
  };

  return (
    <div className="flex flex-col  p-4 rounded-md items-center space-y-2">
      <div className={` p-4 flex rounded-lg shadow-md w-full max-w-full justify-center`}>
        <div className={`mt-2`}>
          <label className="block text-white -700 font-bold mb-2">Select Time</label>
          <input
            type="time"
            value={selectedTime || '12:00'}
            onChange={handleInputChange}
            className="w-full p-4 border rounded-lg bg-black mb-2 text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <motion.div
          className={`mt-4 rounded-md flex justify-center items-center ${isClockVisible ? 'block' : 'hidden'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isClockVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >

        </motion.div>
      </div>

    </div>
  );
};

export default CustomTimePicker;
