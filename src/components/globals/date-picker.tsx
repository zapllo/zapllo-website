'use client';

import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import Box from '@mui/material/Box';

interface CustomDatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ selectedDate, onDateChange }) => {
  const [selectedDateValue, setSelectedDateValue] = React.useState<Dayjs | null>(
    selectedDate ? dayjs(selectedDate) : dayjs(new Date())
  );

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setSelectedDateValue(newValue);
      onDateChange(newValue.toDate());
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', spaceY: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDatePicker
          orientation="landscape"
          value={selectedDateValue}
          onChange={handleDateChange}
          displayStaticWrapperAs="mobile"
          sx={{
            '& .MuiPickersLayout-root': {
              backgroundColor: '#1A1C20',
            },
            '& .MuiPickersToolbar-root': {
              backgroundColor: '#1A1C20',
              color: 'white',
            },
            '& .MuiPickersDay-root': {
              color: 'white',
            },
            '& .Mui-selected': {
              backgroundColor: '#017A5B',
              color: 'white',
            },
            '& .MuiButtonBase-root': {
              color: 'white',
            },
            '& .MuiPickersDay-root:hover': {
              backgroundColor: '#4B5563',
            },
            '& .MuiPickersCalendarHeader-root': {
              backgroundColor: '#1A1C20',
              color: 'white',
            },
            '& .MuiDateCalendar-root': {
              backgroundColor: '#1A1C20',
              color: 'white',
            },
            '& .MuiSvgIcon-root': {
              color: 'white',
            },
            '& .MuiDialogActions-root': {
              backgroundColor: '#1A1C20',
              color: 'white',
            },
            '& .MuiTypography-root': {
              color: 'gray',
            },
            '& .MuiPaper-root': {
              backgroundColor: 'transparent',
            },
            '& .MuiBox-root': {
              border: 'none',
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CustomDatePicker;
