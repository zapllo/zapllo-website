'use client';

import CustomDatePicker from '@/components/globals/date-picker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@/components/ui/dialog';
import axios from 'axios';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';

// Generate all weekdays of a selected month, excluding weekends (Saturday, Sunday)
const generateWeekdaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const weekdays = [];
  while (date.getMonth() === month) {
    // Exclude weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      weekdays.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return weekdays;
};

// Client-side: generateMonthOptions function
const generateMonthOptions = () => {
  const months = [
    { name: 'Jan', value: '01' },
    { name: 'Feb', value: '02' },
    { name: 'Mar', value: '03' },
    { name: 'Apr', value: '04' },
    { name: 'May', value: '05' },
    { name: 'Jun', value: '06' },
    { name: 'Jul', value: '07' },
    { name: 'Aug', value: '08' },
    { name: 'Sep', value: '09' },
    { name: 'Oct', value: '10' },
    { name: 'Nov', value: '11' },
    { name: 'Dec', value: '12' }
  ];

  const currentYear = new Date().getFullYear();

  // Return an array with both the display format and the actual value
  return months.map((month) => ({
    display: `${month.name}-${currentYear.toString().slice(-2)}`, // e.g., Sep-24
    value: `${currentYear}-${month.value}` // e.g., 2024-09
  }));
};

interface AttendanceEntry {
  date: string;
  day: string;
  present: number;
  leave: number;
  absent: number;
  total: number;
}

interface LeaveEntry {
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: string;
}

interface HolidayEntry {
  holidayName: string;
  holidayDate: string;
}

interface UserwiseReport {
  employee: string;
  present: number;
  leave: number;
  absent: number;
}

interface ReportEntry {
  user: string;
  status: string;
  loginTime: string;
  logoutTime: string;
  totalDuration: string;
}

const AttendanceDashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [leaves, setLeaves] = useState<LeaveEntry[]>([]); // State for leaves
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]); // State for holidays
  const [holidaysCumulative, setHolidaysCumulative] = useState<number>(0); // State for holidays
  // const [selectedDate, setSelectedDate] = useState<string>('2024-09');
  const [totalDays, setTotalDays] = useState<number>(0);
  const [totalCumulativeDays, setTotalCumulativeDays] = useState<number>(0);
  const [presentCount, setPresentCount] = useState<number>(0);
  const [leaveCount, setLeaveCount] = useState<number>(0);
  const [absentCount, setAbsentCount] = useState<number>(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [workingDays, setWorkingDays] = useState<number>(0);
  const [holidayCount, setHolidayCount] = useState<number>(0);
  const [period, setPeriod] = useState('thisMonth');
  const [report, setReport] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [managerId, setManagerId] = useState('');
  const [managers, setManagers] = useState([]); // For storing manager options
  const [employees, setEmployees] = useState([]); // For storing manager options
  const monthOptions = generateMonthOptions(); // Generate months dynamically
  const [selectedDate, setSelectedDate] = useState<string>(Date());
  const [isDateSelected, setIsDateSelected] = useState<boolean>(false); // Track whether the user manually selects a date
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>('2024-09');
  const [dailyReport, setDailyReport] = useState<ReportEntry[]>([]);
  const [employeeId, setEmployeeId] = useState();
  const [weekOffs, setWeekOffs] = useState<number>(0);

 
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/organization");
        const result = await response.json();

        if (response.ok) {
          setManagers(result.data);
          setEmployees(result.data);
        } else {
          console.error("Error fetching users:", result.error);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);




  useEffect(() => {
    const fetchCumulativeReport = async () => {
      try {
        const res = await fetch('/api/reports/cumulative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ period, managerId, employeeId }), // Now including managerId
        });
        const { report, totalDays, workingDays, holidays, weekOffs } = await res.json();

        setReport(report);
        setTotalCumulativeDays(totalDays);
        setWorkingDays(workingDays);
        setHolidaysCumulative(holidays.length);
        setWeekOffs(weekOffs);

      } catch (error) {
        console.error('Error fetching cumulative report:', error);
      }
    };

    if (period) fetchCumulativeReport();
  }, [managerId, period, employeeId]); // Trigger on changes in period or managerId

  // Fetch attendance, leave, and holiday data for the entire organization
  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        const response = await fetch(`/api/attendance?date=${selectedAttendanceDate}`);
        const data = await response.json();

        // Update the attendance, leave, and holiday states
        setAttendance(data.monthlyAttendance);
        setLeaves(data.leaves);
        setHolidays(data.holidays);

        // Calculate total working days (excluding weekends)
        const weekdaysInMonth = generateWeekdaysInMonth(
          parseInt(selectedAttendanceDate.split('-')[0]),
          parseInt(selectedAttendanceDate.split('-')[1]) - 1
        );
        setTotalDays(weekdaysInMonth.length);

        let present = 0;
        let leave = 0;
        let absent = 0;

        weekdaysInMonth.forEach((day) => {
          const dayString = day.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

          const isPresent = data.monthlyAttendance.some(entry => entry.date === dayString && entry.present);
          const isLeave = data.leaves.some(leave => leave.fromDate <= dayString && leave.toDate >= dayString);
          const isHoliday = data.holidays.some(holiday => holiday.holidayDate === dayString);

          if (isPresent) {
            present++;
          } else if (isLeave) {
            leave++;
          } else if (isHoliday) {
            // Exclude holidays from working days
            absent++;
          }
        });

        setPresentCount(present);
        setLeaveCount(leave);
        setAbsentCount(absent);
        setWorkingDays(weekdaysInMonth.length - data.holidays.length); // Total working days excluding weekends and holidays
        setHolidayCount(data.holidays.length); // Count the number of holidays
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    }

    fetchAttendanceData();
  }, [selectedAttendanceDate]);


  // Function to fetch the daily report from the server
  const fetchDailyReport = async (date: string) => {
    try {
      const res = await fetch('/api/reports/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, employeeId }),
      });
      const data = await res.json();
      setDailyReport(data.report);
    } catch (error) {
      console.error('Error fetching daily report:', error);
    }
  };

  // Fetch the report when the date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchDailyReport(selectedDate);
    }
  }, [selectedDate, employeeId]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setIsDateSelected(true); // Mark that a date has been selected
  };

  const handleCloseDialog = () => {
    setIsDatePickerOpen(false); // Close the dialog
  };


  return (
    <div className="p-6 h-screen overflow-y-scroll">
      <div className='mb-12  gap-2'>
        <div className="mb-4 flex gap-2 justify-center w-full">
          <select
            className="border rounded text-xs outline-none p-2"
            onChange={(e) => setManagerId(e.target.value)}
          >
            <option value="">Select Manager</option>
            {managers?.map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.firstName} {manager.lastName}
              </option>
            ))}
          </select>
          {/* <label htmlFor="employee" className="mr-2">Employee:</label> */}
          <select
            className="border outline-none text-xs  rounded p-2"
            id="employee"
            onChange={(e) => setEmployeeId(e.target.value)} // Update selected employee
          >
            <option value="">Select Employee</option>
            {employees?.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
          {/* <button onClick={fetchCumulativeReport} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
              Fetch Report
            </button> */}
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div className="flex-1 border  shadow-md rounded p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium ">Daily Report</h3>

              <div>
                {/* <span className="text-sm mr-2">Date:</span> */}
                {/* <input
                  type="date"
                  className="border rounded-lg p-2 text-xs"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                /> */}
                <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <DialogTrigger>
                    <Button
                      type="button"
                      onClick={() => setIsDatePickerOpen(true)}
                      className=" rounded bg-black hover:bg-black px-3 flex gap-1 py-2"
                    >
                      <Calendar className="h-5 text-sm" />
                      {isDateSelected ? (
                        // Show the selected date if the user has interacted
                        <h1 className='text-xs'> {format(selectedDate, 'PPP')}</h1>
                      ) : (
                        <h1 className="text-xs">Select Date</h1>
                      )}
                      {/* <h1 className="text-xs">Select Date & Time</h1> */}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='scale-75 w-[45%] h-[500px] max-w-screen'>
                  {/* <DialogClose className='ml-auto'>X</DialogClose> */}
                    <CustomDatePicker
                      selectedDate={selectedDate}
                      onDateChange={handleDateChange}
                      onCloseDialog={handleCloseDialog} // Close the dialog on date selection
                    />
                  </DialogContent>
                </Dialog>



              </div>
            </div>
            <table className="table-auto border w-full border-collapse">
              <thead className='bg-[#380e3d] rounded'>
                <tr className="text-xs border-t ">
                  <th className=" px-4 py-2 text-left">Name</th>
                  <th className=" px-4 py-2 text-left">Status</th>
                  <th className=" px-4 py-2 text-left">Login Time</th>
                  <th className=" px-4 py-2 text-left">Logout Time</th>
                  <th className=" px-4 py-2 text-left">Total Duration</th>
                </tr>
              </thead>
              <tbody>
                {dailyReport.map((entry, index) => (
                  <tr key={index} className='border-t'>
                    <td className=" px-4 text-xs py-2">{entry.user}</td>
                    <td
                      className={` px-4 text-xs py-2 ${entry.status === 'Present'
                        ? 'text-green-600'
                        : entry.status === 'On Leave'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                        }`}
                    >
                      {entry.status}
                    </td>
                    <td className=" text-xs px-4 py-2">{entry.loginTime}</td>
                    <td className=" text-xs px-4 py-2">{entry.logoutTime}</td>
                    <td className=" text-xs px-4 py-2">{entry.totalDuration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex-1 border b  shadow-md rounded p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Cumulative Report</h3>

              <div>
                <select
                  className="border text-xs rounded-lg p-2"
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                </select>
              </div>

            </div>
            <div className="flex space-x-4 mb-2 mt-2">
              <span className=" border p-2 text-xs">Total Days: {totalCumulativeDays}</span>
              <span className="border p-2 text-xs">Working: {workingDays}</span>
              <span className="border p-2 text-xs">Week Offs: {weekOffs}</span>
              <span className="border p-2 text-xs">Holidays: {holidaysCumulative}</span>
            </div>
            <table className="table-auto border  w-full border-collapse">
              <thead className='bg-[#380e3d] rounded'>
                <tr className="0 text-xs">
                  <th className=" px-4 py-2 text-left">Name</th>
                  <th className=" px-4 py-2 text-left">Present</th>
                  <th className=" px-4 py-2 text-left">Leave</th>
                  <th className=" px-4 py-2 text-left">Absent</th>
                  <th className=" px-4 py-2 text-left">Reporting Manager</th>
                </tr>
              </thead>
              <tbody>
                {report?.map((entry, index) => (
                  <tr className='text-xs border-t' key={index}>
                    <td className=" px-4 py-2">{entry.user}</td>
                    <td className=" px-4 py-2 text-center">{entry.present}</td>
                    <td className=" px-4 py-2 text-center">{entry.leave}</td>
                    <td className=" px-4 py-2 text-center">{entry.absent}</td>
                    <td className=" px-4 py-2">{entry.reportingManager || "Not Assigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className=" flex gap-2">
        <h2 className="text-lg font-semibold">Monthly Report</h2>
        <div className="flex items-center  space-x-4">
          {/* Month selector */}
          <select
            className="p-2 text-sm border outline-none w-24 rounded"
            value={selectedAttendanceDate}
            onChange={(e) => setSelectedAttendanceDate(e.target.value)}
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.display}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 flex w-full justify-center space-x-2">
        <span className="border text-sm text-white p-2 rounded">Total Days: {workingDays}</span>
        <span className="border text-sm text-white p-2 rounded">Working: {presentCount + leaveCount}</span>
        <span className="border text-sm text-white p-2 rounded">Week Offs: {totalDays - workingDays}</span>
        <span className="border text-sm text-white p-2 rounded">Holidays: {holidayCount}</span>
      </div>

      {/* Monthly Attendance Report */}
      <div className="relative mt-6 mb-12">
        <div className="h-full  rounded-md">
          <table className="w-full border-collapse border">
            <thead className='bg-[#380e3d]'>
              <tr>
                <th className="rounded-l text-sm font-medium text-start p-2 w-24 px-4">Date</th>
                <th className="text-sm text-start font-medium w-24 p-2 px-4">Day</th>
                <th className="text-sm text-start w-24 font-medium p-2 px-4">Present</th>
                <th className="text-sm text-start w-24 font-medium p-2 px-4">Leave</th>
                <th className="text-sm text-start w-24 font-medium p-2 px-4">Absent</th>
                <th className="text-sm text-start w-24 font-medium p-2 px-4">Holiday</th>
                <th className="text-sm w-24 rounded-r font-medium p-2 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {generateWeekdaysInMonth(
                parseInt(selectedAttendanceDate.split('-')[0]),
                parseInt(selectedAttendanceDate.split('-')[1]) - 1
              ).map((day, index) => {
                const dayString = day.toISOString().split('T')[0];
                const isPresent = attendance.some(entry => entry.date === dayString && entry.present);
                const isLeave = leaves.some(leave => leave.fromDate <= dayString && leave.toDate >= dayString);
                const isHoliday = holidays.some(holiday => holiday.holidayDate === dayString);
                const isAbsent = !isPresent && !isLeave && !isHoliday;

                return (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 text-xs">{day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-4 py-2 text-xs">{day.toLocaleDateString('en-US', { weekday: 'short' })}</td>
                    <td className="px-4 py-2 text-xs">{isPresent ? 1 : 0}</td>
                    <td className="px-4 py-2 text-xs">{isLeave ? 1 : 0}</td>
                    <td className="px-4 py-2 text-xs">{isAbsent ? 1 : 0}</td>
                    <td className="px-4 py-2 text-xs">{isHoliday ? 1 : 0}</td>
                    <td className="px-4 py-2 text-xs">1</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>


      </div>
    </div>
  );
};

export default AttendanceDashboard;
