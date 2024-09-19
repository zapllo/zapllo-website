'use client';

import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import Box from '@mui/material/Box';

interface CustomTimePickerProps {
  selectedTime: string | null;
  onTimeChange: (time: string) => void;
  onCancel: () => void;
  onAccept: () => void;
  onBackToDatePicker: () => void;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  selectedTime,
  onTimeChange,
  onCancel,
  onAccept,
  onBackToDatePicker,
}) => {
  const [selectedTimeValue, setSelectedTimeValue] = React.useState<Dayjs | null>(
    selectedTime ? dayjs(`1970-01-01T${selectedTime}:00`) : dayjs('1970-01-01T12:00:00')
  );

  const handleTimeChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setSelectedTimeValue(newValue);

      // Format the time correctly as hh:mm A for 12-hour format
      const formattedTime = newValue.format('HH:mm'); // Using 24-hour format for accuracy
      onTimeChange(formattedTime); // Pass the correctly formatted time back to the parent component
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', spaceY: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticTimePicker
          orientation="landscape"
          value={selectedTimeValue}
          onChange={handleTimeChange}
          displayStaticWrapperAs="mobile"
          ampm={true} // Enable 12-hour format with AM/PM
          sx={{
            '& .MuiPickersLayout-root': {
              backgroundColor: 'transparent',
            },
            '& .MuiPickersToolbar-root': {
              backgroundColor: '#1A1C20',
              color: 'white',
            },
            '& .MuiTypography-root.Mui-selected': {
              color: 'white', // Active AM/PM button typography is white
            },
            '& .MuiTypography-root': {
              color: 'gray', // Inactive AM/PM button typography is gray
            },
            '& .MuiPickersToolbar-content': {
              color: 'white',
            },
            '& .MuiTimeClock-root': {
              backgroundColor: '#1A1C20',
            },
            '& .MuiClock-wrapper': {
              backgroundColor: 'white',
            },
            '& .MuiClockNumber-root': {
              color: 'white',
            },
            '& .MuiDialogActions-root': {
              backgroundColor: '#1A1C20',
            },
            '& .MuiButtonBase-root': {
              color: 'white',
            },
            '& .MuiSvgIcon-root': {
              color: 'white',
            },
            '& .MuiClockPicker-root': {
              backgroundColor: 'transparent',
            },
            '& .MuiPaper-root': {
              backgroundColor: 'transparent',
            },
            '& .MuiBox-root': {
              border: 'none',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 2 }}>
         
          <button
            onClick={onBackToDatePicker}
            className="bg-gray-600 absolute -mt-[56px] text-xs hover:bg-gray-600 text-white rounded px-4 py-2"
          >
            Back to Date Picker
          </button>
          <button
            onClick={onAccept}
            className="bg-green-600 absolute -mt-[56px] right-12 hover:bg-green-700 text-white rounded px-4 py-2"
          >
            OK
          </button>
        </Box>
      </LocalizationProvider>
    </Box>
  );
};

export default CustomTimePicker;
