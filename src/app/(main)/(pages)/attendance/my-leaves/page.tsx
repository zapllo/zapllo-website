"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
} from "@/components/ui/dialog";
import MyLeaveForm from "@/components/forms/MyLeavesForm"; // Your form component
import LeaveDetails from "@/components/sheets/leaveDetails";
import { Calendar, CheckCircle, Circle, Info } from "lucide-react";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import Loader from "@/components/ui/loader";
import CustomDatePicker from "@/components/globals/date-picker";

interface LeaveType {
  allotedLeaves: number;
  _id: string;
  leaveType: string;
}

interface LeaveDay {
  date: string;
  unit:
    | "Full Day"
    | "1st Half"
    | "2nd Half"
    | "1st Quarter"
    | "2nd Quarter"
    | "3rd Quarter"
    | "4th Quarter";
  status: "Pending" | "Approved" | "Rejected";
}

interface Leave {
  _id: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  status: string;
  appliedDays: number;
  leaveDays: LeaveDay[];
  user: {
    firstName: string;
    lastName: string;
    _id: string;
  }; // Add user field to match your MongoDB model
  remarks: string;
  approvedBy: {
    firstName: string;
    lastName: string;
    _id: string;
  };
  rejectedBy: {
    firstName: string;
    lastName: string;
    _id: string;
  };
  leaveReason: string;
  updatedAt: string;
}

interface LeaveDetails {
  totalAllotedLeaves: number;
  userLeaveBalance: number;
}

const leaveTypeInfo: Record<
  string,
  { title: string; description: string; details: string }
> = {
  "Casual Leave": {
    title: "Casual Leave",
    description:
      "Casual Leave is intended for short-term personal needs such as attending to personal matters, family emergencies, or other unforeseen events.",
    details:
      "Allotted: 12 days | Type: Paid\nBackdated Leave Days: 60 | Advance Leave Days: 90\nInclude Holidays: false | Include Weekends: false\nUnit: Full Day, Half Day, Short Leave\nDeduction(in Days): Full day - 1, Half Day - 0.5, Short Leave - 0.25",
  },
  "Sick Leave": {
    title: "Sick Leave",
    description:
      "Sick Leave can be availed by employees when they are ill or need medical attention. This type of leave is intended for health-related absences.",
    details:
      "Allotted: 12 days | Type: Paid\nBackdated Leave Days: 60 | Advance Leave Days: 90\nInclude Holidays: false | Include Weekends: false\nUnit: Full Day, Half Day, Short Leave\nDeduction(in Days): Full day - 1, Half Day - 0.5, Short Leave - 0.25",
  },
  "Earned Leave": {
    title: "Earned Leave",
    description:
      "Earned Leave, also known as Annual Leave or Privilege Leave, is accrued based on the length of service and can be used for planned vacations or personal time off.",
    details:
      "Allotted: 15 days | Type: Paid\nBackdated Leave Days: 60 | Advance Leave Days: 90\nInclude Holidays: false | Include Weekends: false\nUnit: Full Day, Half Day, Short Leave\nDeduction(in Days): Full day - 1, Half Day - 0.5, Short Leave - 0.25",
  },
  "Leave Without Pay": {
    title: "Leave Without Pay",
    description:
      "Leave Without Pay is granted when an employee has exhausted all other leave types and still needs time off. This leave is unpaid.",
    details:
      "Allotted: 6 days | Type: Unpaid\nBackdated Leave Days: 60 | Advance Leave Days: 90\nInclude Holidays: false | Include Weekends: false\nUnit: Full Day, Half Day, Short Leave\nDeduction(in Days): Full day - 1, Half Day - 0.5, Short Leave - 0.25",
  },
};

const months = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const MyLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveDetails, setLeaveDetails] = useState<{
    [key: string]: LeaveDetails;
  }>({});
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{
    title: string;
    description: string;
    details: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("thisMonth"); // Set default to 'thisMonth'
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false); // For triggering the start date picker
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false); // For triggering the end date picker

  const normalizeDate = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isWithinDateRange = (date: Date, startDate: Date, endDate: Date) =>
    date >= startDate && date <= endDate;

  // Filter leaves by both date range (active tab) and other filters
  const filterEntriesByTab = () => {
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const todayNormalized = normalizeDate(today);

    let dateFilteredLeaves = leaves;

    switch (activeTab) {
      case "today":
        dateFilteredLeaves = leaves.filter(
          (leave) =>
            normalizeDate(new Date(leave.fromDate)).getTime() ===
            todayNormalized.getTime()
        );
        break;
      case "thisWeek":
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        dateFilteredLeaves = leaves.filter((leave) => {
          const leaveDate = normalizeDate(new Date(leave.fromDate));
          return (
            leaveDate >= normalizeDate(thisWeekStart) &&
            leaveDate <= todayNormalized
          );
        });
        break;
      case "thisMonth":
        dateFilteredLeaves = leaves.filter((leave) => {
          const leaveDate = normalizeDate(new Date(leave.fromDate));
          return leaveDate >= thisMonthStart && leaveDate <= todayNormalized;
        });
        break;
      case "lastMonth":
        dateFilteredLeaves = leaves.filter((leave) => {
          const leaveDate = normalizeDate(new Date(leave.fromDate));
          return leaveDate >= lastMonthStart && leaveDate <= lastMonthEnd;
        });
        break;
      case "custom":
        if (customDateRange.start && customDateRange.end) {
          const startNormalized = normalizeDate(customDateRange.start);
          const endNormalized = normalizeDate(customDateRange.end);
          dateFilteredLeaves = leaves.filter((leave) => {
            const leaveDate = normalizeDate(new Date(leave.fromDate));
            return leaveDate >= startNormalized && leaveDate <= endNormalized;
          });
        }
        break;
      default:
        break;
    }

    // Apply additional filters like leave type, status, year, and month
    return dateFilteredLeaves
      .filter((leave) =>
        selectedLeaveType
          ? leave.leaveType.leaveType === selectedLeaveType
          : true
      )
      .filter((leave) => {
        const leaveDate = new Date(leave.fromDate);
        return (
          leaveDate.getFullYear() === selectedYear &&
          leaveDate.getMonth() === selectedMonth
        );
      })
      .filter((leave) =>
        selectedStatus === "All" ? true : leave.status === selectedStatus
      );
  };

  const handleLeaveClick = (leave: Leave) => {
    setSelectedLeave(leave);
  };

  const handleSheetClose = () => {
    setSelectedLeave(null);
  };

  // Handle Custom Date Range Modal
  const openCustomModal = () => {
    setIsCustomModalOpen(true);
  };

  const handleCustomDateSubmit = (start: Date, end: Date) => {
    setCustomDateRange({ start, end });
    setIsCustomModalOpen(false);
    setActiveTab("custom");
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get("/api/leaves/leaveType");
      setLeaveTypes(response.data);
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };

  const fetchLeaveDetails = async (leaveTypes: LeaveType[]) => {
    try {
      setLoading(true);
      const leaveDetailsMap: { [key: string]: LeaveDetails } = {};

      for (const leaveType of leaveTypes) {
        const response = await axios.get(`/api/leaves/${leaveType._id}`);
        console.log(response.data, "response.data");
        if (response.data.success) {
          leaveDetailsMap[leaveType._id] = {
            totalAllotedLeaves: response.data.data.allotedLeaves,
            userLeaveBalance: response.data.data.userLeaveBalance,
          };
          setLoading(false);
        } else {
          leaveDetailsMap[leaveType._id] = {
            totalAllotedLeaves: 0,
            userLeaveBalance: 0,
          };
        }
      }

      setLeaveDetails(leaveDetailsMap);
    } catch (error) {
      console.error("Error fetching leave details:", error);
    }
  };

  const fetchUserLeaves = async () => {
    try {
      // setLoading(true)
      const response = await axios.get("/api/leaves");
      if (response.data.success) {
        setLeaves(response.data.leaves);
        setLoading(false);
      } else {
        console.error("Error: No leaves found");
      }
    } catch (error) {
      console.error("Error fetching user leaves:", error);
    }
  };

  useEffect(() => {
    fetchUserLeaves();
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    if (leaveTypes.length > 0) {
      fetchLeaveDetails(leaveTypes);
    }
  }, [leaveTypes]);
  const handleInfoClick = (leaveType: string) => {
    if (leaveTypeInfo[leaveType]) {
      setInfoModalContent(leaveTypeInfo[leaveType]);
      setIsInfoModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchUserLeaves();
    setIsInfoModalOpen(false);
    setInfoModalContent(null);
  };

  const filteredLeaves = filterEntriesByTab();

  // Count leaves based on status
  const pendingCount = leaves.filter(
    (leave) => leave.status === "Pending"
  ).length;
  const approvedCount = leaves.filter(
    (leave) => leave.status === "Approved"
  ).length;
  const rejectedCount = leaves.filter(
    (leave) => leave.status === "Rejected"
  ).length;

  console.log(leaveDetails, "leaveDetails");

  if (loading) {
    return (
      <div className="mt-32 flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container h-screen  overflow-y-scroll scrollbar-hide t mx-auto p-6">
      <div className="flex items-center justify-center gap-4 mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border-2 rounded px-3 border-[#380E3D] outline-none text-xs py-2"
        >
          {[2022, 2023, 2024, 2025].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border-2 border-[#380E3D] rounded px-3 outline-none text-xs py-2"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button
              className="bg-[#017a5b] text-white text-xs px-4 py-2 rounded"
              onClick={() => setIsModalOpen(true)}
            >
              Apply Leave
            </button>
          </DialogTrigger>

          <DialogContent className="hidden ">
            <DialogDescription>
              Select leave type and details to apply for leave.
            </DialogDescription>
            <MyLeaveForm leaveTypes={leaveTypes} onClose={handleModalClose} />
          </DialogContent>
        </Dialog>
      </div>
      {/* Date Tabs */}
      <div className="tabs mb-6 flex flex-wrap justify-center space-x-2">
        <button
          onClick={() => setActiveTab("today")}
          className={`px-4 h-fit py-2 text-xs rounded ${
            activeTab === "today" ? "bg-[#7c3987]" : "bg-[#28152e]"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab("thisWeek")}
          className={`px-4 py-2 h-fit text-xs rounded ${
            activeTab === "thisWeek" ? "bg-[#7c3987]" : "bg-[#28152e]"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setActiveTab("thisMonth")}
          className={`px-4 py-2 text-xs h-fit rounded ${
            activeTab === "thisMonth" ? "bg-[#7c3987]" : "bg-[#28152e]"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setActiveTab("lastMonth")}
          className={`px-4 py-2 text-xs h-fit rounded ${
            activeTab === "lastMonth" ? "bg-[#7c3987]" : "bg-[#28152e]"
          }`}
        >
          Last Month
        </button>
        <button
          onClick={openCustomModal}
          className={`px-4 py-2 text-xs h-fit rounded ${
            activeTab === "custom" ? "bg-[#7c3987]" : "bg-[#28152e]"
          }`}
        >
          Custom
        </button>
      </div>

      {/* Leave Balance and Type Filter */}
      {leaveTypes.length > 0 && (
        <div className="items-center space-x-4 mb-4">
          <div className="flex justify-center gap-4 w-full">
            <div className="grid grid-cols-4 gap-4">
              {leaveTypes.map((leaveType) => (
                <div
                  key={leaveType._id}
                  className="border w-48 px-2  py-3 mb-4"
                >
                  <div className="flex justify-between w-full">
                    <h1 className="text-sm">{leaveType.leaveType}</h1>
                    <Info
                      className="h-4 mt-[2px]  text-blue-200 cursor-pointer"
                      onClick={() => handleInfoClick(leaveType.leaveType)}
                    />
                  </div>
                  <div className="gap-2 mt-2">
                    <h1 className="text-xs">
                      Alloted: {leaveType.allotedLeaves}
                    </h1>
                    {/* Fetch leave details from leaveDetails map using the leaveType._id */}
                    {leaveDetails[leaveType._id] ? (
                      <div>
                        <p className="text-xs">
                          Balance:{" "}
                          {leaveDetails[leaveType._id]?.userLeaveBalance ??
                            "N/A"}
                        </p>
                      </div>
                    ) : (
                      <div>Loading...</div> // Add a loading state if needed
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full justify-center">
            <div>
              <select
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                className="border-2 rounded text-xs border-[#380e3d]  outline-none px-3 py-2"
              >
                <option value="">Leave Type</option>
                {leaveTypes.map((type) => (
                  <option key={type._id} value={type.leaveType}>
                    {type.leaveType}
                  </option>
                ))}
              </select>
            </div>
            {/* Status Filters */}
            <div className="flex items-center  text-xs space-x-4 mb-4">
              <button
                className={`px-4 py-2 flex gap-2 rounded ${
                  selectedStatus === "All"
                    ? "bg-[#7c3987] text-white"
                    : "bg-[#28152e]"
                }`}
                onClick={() => setSelectedStatus("All")}
              >
                <HamburgerMenuIcon />
                All ({leaves.length})
              </button>
              <button
                className={`px-4 py-2 flex gap-2 rounded ${
                  selectedStatus === "Pending"
                    ? "bg-[#7c3987] text-white"
                    : "bg-[#28152e]"
                }`}
                onClick={() => setSelectedStatus("Pending")}
              >
                <Circle className="h-4 text-red-500" />
                Pending ({pendingCount})
              </button>
              <button
                className={`px-4 py-2 flex gap-2 rounded ${
                  selectedStatus === "Approved"
                    ? "bg-[#7c3987] text-white"
                    : "bg-[#28152e]"
                }`}
                onClick={() => setSelectedStatus("Approved")}
              >
                <CheckCircle className="h-4 text-green-500" />
                Approved ({approvedCount})
              </button>
              <button
                className={`px-4 py-2 flex gap-2 rounded ${
                  selectedStatus === "Rejected"
                    ? "bg-[#7c3987] text-white"
                    : "bg-[#28152e]"
                }`}
                onClick={() => setSelectedStatus("Rejected")}
              >
                <Cross1Icon className="h-4 text-red-500" />
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {infoModalContent && (
        <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
          <DialogContent className="w-96">
            <div className="flex w-full justify-between">
              <div className="flex gap-2">
                <Info className="h-5 mt-1 " />
                <DialogTitle className="text-center text-lg flex gap-2 font-semibold">
                  {infoModalContent.title}
                </DialogTitle>
              </div>

              <DialogClose>X</DialogClose>
            </div>
            <DialogDescription className="mt-2 text-sm">
              {infoModalContent.description}
            </DialogDescription>
            <div className="mt-4 text-xs">
              {infoModalContent.details.split("\n").map((line, index) => (
                <p key={index} className="leading-5">
                  {line}
                </p>
              ))}
            </div>
            {/* <button
                            className="mt-6 bg-[#017a5b] text-white px-4 py-2 rounded w-full"
                            onClick={handleModalClose}
                        >
                            Close
                        </button> */}
          </DialogContent>
        </Dialog>
      )}

      {/* Display Filtered Leaves */}
      <div className="grid grid-cols-1 w-full mb-12 ">
        {filteredLeaves?.length > 0 ? (
          filteredLeaves?.map((leave) => (
            <div
              key={leave._id}
              className="flex hover:border-[#75517B] items-center  cursor-pointer justify-between border p-4 rounded shadow-sm mb-4"
              onClick={() => handleLeaveClick(leave)}
            >
              {/* User Profile Icon */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-[#7c3987] flex items-center justify-center text-white text-sm">
                    {leave.user.firstName?.[0]}
                  </div>
                </div>
                <h1 className="text-s">{leave.user.firstName}</h1>

                {/* Leave Details */}
                <div className=" flex gap-4">
                  <h3 className=" text-sm mt-[5px]">
                    {leave?.leaveType?.leaveType}
                  </h3>
                  <p className="text-sm flex gap-1 mt-1 text-gray-400">
                    From:{" "}
                    <span className="text-white">
                      {new Date(leave?.fromDate).toLocaleDateString()}
                    </span>
                    <h1 className="gap-1 ml-4 flex">
                      To:
                      <span className="text-white">
                        {new Date(leave?.toDate).toLocaleDateString()}
                      </span>
                    </h1>
                  </p>
                  <p className="text-sm flex gap-1 mt-1 text-gray-400">
                    Applied For:
                    <span className="text-white">
                      {leave.appliedDays} Day(s)
                    </span>
                    |<span className="ml-1">Approved For:</span>
                    <span className="text-white">
                      {
                        leave.leaveDays.filter(
                          (day) => day.status === "Approved"
                        ).length
                      }{" "}
                      Day(s)
                    </span>
                  </p>
                </div>
              </div>
              {/* Status and Approval */}
              <div className="flex items-center">
                <span
                  className={`px-3  py-1 rounded-full text-[10px] ${
                    leave.status === "Approved"
                      ? "bg-green-700  text-white"
                      : leave.status === "Partially Approved"
                      ? "bg-orange-900 text-white -800"
                      : leave.status === "Rejected"
                      ? "bg-orange-200 text-red-800"
                      : "bg-orange-700 text-white -800"
                  }`}
                >
                  {leave.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex w-full justify-center ">
            <div className="mt-8 ml-4">
              <img src="/animations/notfound.gif" className="h-56 ml-8" />
              <h1 className="text-center font-bold text-md mt-2 ">
                No Leaves Found
              </h1>
              <p className="text-center text-sm ">
                The list is currently empty for the selected filters
              </p>
            </div>
          </div>
        )}
      </div>
      {selectedLeave && (
        <LeaveDetails
          selectedLeave={selectedLeave}
          onClose={handleSheetClose}
        />
      )}

      {/* Custom Date Range Modal */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="w-96">
          <div className="flex justify-between">
            <DialogTitle className="text-md mb-4 font-medium text-white">
              Select Custom Date Range
            </DialogTitle>
            <DialogClose className="h-8 scale-75">
              {" "}
              <img
                src="/icons/cross.png"
                className="h-7 hover:bg-[#121212] rounded-full"
              />
            </DialogClose>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customDateRange.start && customDateRange.end) {
                handleCustomDateSubmit(
                  customDateRange.start,
                  customDateRange.end
                );
              }
            }}
            className="space-y-4"
          >
            <div className="flex justify-between gap-2">
              {/* Start Date Button */}
              <div className="w-full">
                {/* <h1 className="absolute bg-[#1A1C20] ml-2 text-xs font-medium text-white">
                  Start Date
                </h1> */}
                <button
                  type="button"
                  className="text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                  onClick={() => setIsStartPickerOpen(true)} // Open start date picker
                >
                  {/* {customDateRange.start
                    ? new Date(customDateRange.start).toLocaleDateString(
                        "en-GB"
                      ) // Format date as dd/mm/yyyy
                    : "Select Start Date"} */}
                  {customDateRange.start ? (
                    <div className="flex-gap-1">
                      <Calendar className="h-4" />
                      {new Date(customDateRange.start).toLocaleDateString(
                        "en-GB"
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Calendar className="h-4" />
                      <h1 className="text-xs">Start date</h1>
                    </div>
                  )}
                </button>
              </div>

              {/* End Date Button */}
              <div className="w-full">
                {/* <h1 className="absolute bg-[#1A1C20] ml-2 text-xs font-medium text-white">
                  End Date
                </h1> */}
                <button
                  type="button"
                  className="text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                  onClick={() => setIsEndPickerOpen(true)} // Open end date picker
                >
                  {customDateRange.end
                    ? new Date(customDateRange.end).toLocaleDateString("en-GB") // Format date as dd/mm/yyyy
                    : "Select End Date"}
                </button>
              </div>
            </div>
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="bg-[#017A5B] text-white py-2 px-4 rounded w-full text-xs"
              >
                Apply
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Start Date Picker Modal */}
      <Dialog open={isStartPickerOpen} onOpenChange={setIsStartPickerOpen}>
        <DialogContent className="w-full scale-75">
          <div className="flex justify-between">
            <CustomDatePicker
              selectedDate={customDateRange.start}
              onDateChange={(newDate) => {
                setCustomDateRange((prev) => ({ ...prev, start: newDate }));
                setIsStartPickerOpen(false); // Close picker after selecting the date
              }}
              onCloseDialog={() => setIsStartPickerOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* End Date Picker Modal */}
      <Dialog open={isEndPickerOpen} onOpenChange={setIsEndPickerOpen}>
        <DialogContent className="w-full scale-75">
          <div className="flex justify-between">
            <CustomDatePicker
              selectedDate={customDateRange.end}
              onDateChange={(newDate) => {
                setCustomDateRange((prev) => ({ ...prev, end: newDate }));
                setIsEndPickerOpen(false); // Close picker after selecting the date
              }}
              onCloseDialog={() => setIsEndPickerOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyLeaves;
