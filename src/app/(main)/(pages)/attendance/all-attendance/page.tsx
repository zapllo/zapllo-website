'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, startOfDay, startOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import RegularizationApprovalModal from '@/components/modals/regularizationApprovalModal';
import RegularizationRejectModal from '@/components/modals/rejectRegularizationModal';
import RegularizationDetails from '@/components/sheets/regularizationDetails';
import { Accordion2, AccordionContent2, AccordionItem2, AccordionTrigger2 } from '@/components/ui/simple-accordion';
import { CalendarDays, CheckCheck, Trash2, Users2, X } from 'lucide-react';
import DeleteConfirmationDialog from '@/components/modals/deleteConfirmationDialog';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Loader from '@/components/ui/loader';
import CustomDatePicker from '@/components/globals/date-picker';

type User = {
  _id: string;
  firstName: string;
};

type Attendance = {
  _id: string;
  userId: User;
  action: 'login' | 'logout';
  timestamp: string;
  lat?: number;
  lng?: number;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  approvalRemarks?: string;
};

type Regularization = {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    reportingManager: {
      firstName: string;
      lastName: string;
    };
  };
  action: 'regularization';
  timestamp: string;
  loginTime: string;
  logoutTime: string;
  remarks: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvalRemarks?: string;
  approvedBy?: string;
  approvedAt?: string;
};

function isRegularization(entry: Attendance | Regularization): entry is Regularization {
  return entry.action === 'regularization';
}

function isAttendance(entry: Attendance | Regularization): entry is Attendance {
  return entry.action === 'login' || entry.action === 'logout';
}

export default function AllAttendance() {
  const [groupedEntries, setGroupedEntries] = useState<{
    [key: string]: { user: User; dates: { [date: string]: Attendance[] } };
  }>({});
  const [regularizations, setRegularizations] = useState<Regularization[]>([]);
  const [filter, setFilter] = useState<'Attendance' | 'Regularization'>('Attendance');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [dateFilter, setDateFilter] = useState<
    'Today' | 'Yesterday' | 'ThisWeek' | 'ThisMonth' | 'LastMonth' | 'Custom' | 'AllTime'
  >('ThisMonth');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false); // For custom date modal
  const [selectedEntry, setSelectedEntry] = useState<Attendance | Regularization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRegularizationDetailsOpen, setIsRegularizationDetailsOpen] = useState(false);
  const [remarks, setRemarks] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [regularizationIdToDelete, setRegularizationIdToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false); // For triggering the start date picker
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false); // For triggering the end date picker

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        if (filter === 'Attendance') {
          const response = await axios.get('/api/get-all-attendance');
          if (response.data.success) {
            const groupedByUser = groupEntriesByUserAndDate(response.data.entries);
            setGroupedEntries(groupedByUser);
            setLoading(false);
          }
        } else if (filter === 'Regularization') {
          const response = await axios.get('/api/all-regularization-approvals');
          if (response.data.success) {
            setRegularizations(response.data.regularizations);
            setLoading(false);
          }
        }
      } catch (error: any) {
        console.error(`Error fetching ${filter} entries:`, error.response?.data || error.message);
        alert(`Failed to fetch ${filter} entries: ${error.response?.data?.message || error.message}`);
      }
    };

    fetchEntries();
  }, [filter]);

  // Grouping function: Group attendance entries by user and then by date
  const groupEntriesByUserAndDate = (entries: Attendance[]) => {
    const grouped: {
      [key: string]: { user: User; dates: { [date: string]: Attendance[] } };
    } = {};

    entries.forEach((entry) => {
      const userId = entry.userId._id;
      const date = format(new Date(entry.timestamp), 'yyyy-MM-dd');

      if (!grouped[userId]) {
        grouped[userId] = {
          user: entry.userId,
          dates: {},
        };
      }

      if (!grouped[userId].dates[date]) {
        grouped[userId].dates[date] = [];
      }

      grouped[userId].dates[date].push(entry);
    });

    return grouped;
  };

  // Helper function for date filtering logic
  const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const filterEntriesByDate = (entries: (Attendance | Regularization)[]) => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const todayStart = startOfDay(today);
    const weekStart = startOfWeek(today);
    const thisMonthStart = startOfMonth(today);
    const lastMonthStart = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    const lastMonthEnd = endOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1));

    return entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);

      switch (dateFilter) {
        case 'Today':
          return normalizeDate(entryDate).getTime() === todayStart.getTime();
        case 'Yesterday':
          return normalizeDate(entryDate).getTime() === normalizeDate(yesterday).getTime();
        case 'ThisWeek':
          return entryDate >= weekStart && entryDate <= today;
        case 'ThisMonth':
          return entryDate >= thisMonthStart && entryDate <= today;
        case 'LastMonth':
          return entryDate >= lastMonthStart && entryDate <= lastMonthEnd;
        case 'Custom':
          if (customDateRange.start && customDateRange.end) {
            return entryDate >= customDateRange.start && entryDate <= customDateRange.end;
          }
          return true;
        case 'AllTime':
          return true;
        default:
          return true;
      }
    });
  };

  const handleRegularizationClick = (regularization: Regularization) => {
    setSelectedEntry(regularization); // Set selected entry
    setIsRegularizationDetailsOpen(true); // Open details sheet
  };

  const handleModalSubmit = async () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
    // Refetch regularization data after approval
    try {
      const response = await axios.get('/api/all-regularization-approvals');
      setRegularizations(response.data.regularizations);
    } catch (error: any) {
      console.error(`Error refetching regularizations:`, error.response?.data || error.message);
    }
  };

  const handleCustomDateSubmit = (start: Date, end: Date) => {
    setCustomDateRange({ start, end });
    setIsCustomModalOpen(false);
  };

  const filteredRegularizations = filterEntriesByDate(
    statusFilter === 'All'
      ? regularizations
      : regularizations.filter((entry) => entry.approvalStatus === statusFilter)
  ) as Regularization[];

  const filteredAttendance = filterEntriesByDate(
    Object.values(groupedEntries)
      .flatMap((user) =>
        Object.values(user.dates).flat()
      )
  ).filter(isAttendance) as Attendance[];

  const handleApproval = (entry: Regularization, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleReject = (entry: Regularization, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEntry(entry);
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!remarks) {
      alert('Please enter remarks for rejection.');
      return;
    }
    try {
      if (!selectedEntry || !isRegularization(selectedEntry)) return;

      const response = await axios.patch(`/api/regularization-approvals/${selectedEntry._id}`, {
        action: 'reject',
        notes: remarks,
      });

      if (response.data.success) {
        const updatedEntries = await axios.get('/api/all-regularization-approvals');
        setRegularizations(updatedEntries.data.regularizations);
        setIsRejectModalOpen(false);
        setSelectedEntry(null);
        setRemarks(''); // Clear remarks
      } else {
        throw new Error(response.data.message || 'Failed to reject regularization request.');
      }
    } catch (error: any) {
      console.error(`Error rejecting regularization:`, error.response?.data || error.message);
      alert(`Failed to reject regularization`);
    }
  };

  const confirmDelete = async () => {
    if (!regularizationIdToDelete) return;

    try {
      const response = await axios.delete(`/api/regularization-approvals/${regularizationIdToDelete}`);
      if (response.data.success) {
        // Refetch regularization entries after deletion
        const updatedEntries = await axios.get('/api/all-regularization-approvals');
        setRegularizations(updatedEntries.data.regularizations);
        setIsDeleteDialogOpen(false); // Close dialog
        setRegularizationIdToDelete(null); // Reset regularization ID
      } else {
        throw new Error(response.data.message || 'Failed to delete regularization.');
      }
    } catch (error: any) {
      console.error(`Error deleting regularization:`, error.response?.data || error.message);
      alert(`Failed to delete regularization`);
    }
  };

  const openDeleteDialog = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    setRegularizationIdToDelete(entryId); // Store regularization ID
    setIsDeleteDialogOpen(true); // Open confirmation dialog
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsRejectModalOpen(false);
    setSelectedEntry(null);
    setRemarks('');
  };

  if (loading) {
    return (
      <div className='mt-32 flex justify-center items-center'>
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Date Filter Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setDateFilter('Today')}
          className={`px-4 text-xs h-8 rounded ${dateFilter === 'Today' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'
            }`}
        >
          Today
        </button>
        <button
          onClick={() => setDateFilter('Yesterday')}
          className={`px-4 text-xs h-8 rounded ${dateFilter === 'Yesterday' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'
            }`}
        >
          Yesterday
        </button>
        <button
          onClick={() => setDateFilter('ThisWeek')}
          className={`px-4 text-xs h-8 rounded ${dateFilter === 'ThisWeek' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'
            }`}
        >
          This Week
        </button>
        <button
          onClick={() => setDateFilter('ThisMonth')}
          className={`px-4 text-xs h-8 rounded ${dateFilter === 'ThisMonth' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'
            }`}
        >
          This Month
        </button>
        <button
          onClick={() => setDateFilter('LastMonth')}
          className={`px-4 text-xs h-8 rounded ${dateFilter === 'LastMonth' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'
            }`}
        >
          Last Month
        </button>
        <button
          onClick={() => setDateFilter('AllTime')}
          className={`px-4 text-xs h-8 rounded ${dateFilter === 'AllTime' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'
            }`}
        >
          All Time
        </button>
        <button
          onClick={() => setIsCustomModalOpen(true)}
          className={`px-4 text-xs h-8 rounded ${dateFilter === 'Custom' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'
            }`}
        >
          Custom
        </button>
      </div>

      {/* Tabs for Attendance and Regularization */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setFilter('Attendance')}
          className={`px-4 text-xs flex py-2 rounded ${filter === 'Attendance' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'
            }`}
        >
          <CalendarDays className="h-4" />
          <h1>All Attendance</h1>
        </button>
        <button
          onClick={() => setFilter('Regularization')}
          className={`px-4 text-xs flex py-2 rounded ${filter === 'Regularization' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'
            }`}
        >
          <Users2 className="h-4" />
          All Regularizations
        </button>
      </div>

      {/* Attendance Section */}
      {filter === 'Attendance' && (
        <Accordion2 type="multiple" className="space-y-4">
          {Object.keys(groupedEntries).length === 0 ? (
            <div className='flex w-full justify-center '>
              <div className="mt-8 ml-4">
                <img src='/animations/notfound.gif' className="h-56 ml-8" />
                <h1 className="text-center font-bold text-md mt-2 ">
                  No Attendance Records Found
                </h1>
                <p className="text-center text-sm ">The list is currently empty for the selected filters</p>
              </div>
            </div>
          ) : (
            Object.keys(groupedEntries).map((userId) => (
              <AccordionItem2 key={userId} value={userId}>
                <div className="border px-4">
                  <AccordionTrigger2>
                    <div className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-[#7c3987] flex items-center justify-center text-white text-sm">
                        {groupedEntries[userId].user.firstName[0]}
                      </div>
                      {groupedEntries[userId].user.firstName}
                    </div>
                  </AccordionTrigger2>
                </div>
                <AccordionContent2>
                  <div className="px-4 border">
                    {Object.keys(groupedEntries[userId].dates).map((date) => (
                      <Accordion2 key={date} type="single" collapsible>
                        <AccordionItem2 value={date}>
                          <AccordionTrigger2>{format(new Date(date), 'MMM d, yyyy')}</AccordionTrigger2>
                          <AccordionContent2>
                            {groupedEntries[userId].dates[date].map((entry) => (
                              <div key={entry._id} className="flex justify-between items-center border-b py-2">
                                <span className="text-white">
                                  {entry.action === 'login' ? 'Login' : 'Logout'} at{' '}
                                  {format(new Date(entry.timestamp), 'hh:mm a')}
                                </span>
                              </div>
                            ))}
                          </AccordionContent2>
                        </AccordionItem2>
                      </Accordion2>
                    ))}
                  </div>
                </AccordionContent2>
              </AccordionItem2>
            ))
          )}
        </Accordion2>
      )}

      {/* Regularization Section */}
      {filter === 'Regularization' && (
        <div className="space-y-4">
          {filteredRegularizations.length === 0 ? (
            <div className='flex w-full justify-center '>
              <div className="mt-8 ml-4">
                <img src='/animations/notfound.gif' className="h-56 ml-8" />
                <h1 className="text-center font-bold text-md mt-2 ">
                  No Regularization Entries Found
                </h1>
                <p className="text-center text-sm ">The list is currently empty for the selected filters</p>
              </div>
            </div>
          ) : (
            filteredRegularizations.map((entry) => (
              <div className="border hover:border-[#75517B] cursor-pointer" key={entry._id}>
                <div
                  onClick={() => handleRegularizationClick(entry)}
                  className="flex items-center justify-between px-4 rounded shadow-sm py-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-6 rounded-full bg-[#7c3987] flex items-center justify-center text-white text-sm">
                      {entry.userId.firstName[0]}
                    </div>
                    <h3 className="text-md text-white">{entry.userId.firstName}</h3>
                    <p className="text-sm text-gray-400">
                      Date: <span className="text-white">{format(new Date(entry.timestamp), 'MMM d, yyyy')}</span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${entry.approvalStatus === 'Pending'
                      ? 'bg-yellow-800 text-white'
                      : entry.approvalStatus === 'Approved'
                        ? 'bg-green-800 text-white'
                        : 'bg-red-500 text-white'
                      }`}
                  >
                    {entry.approvalStatus}
                  </span>
                </div>
                {entry.approvalStatus === 'Pending' && (
                  <div className="flex gap-2 ml-4 w-full mb-4 justify-start">
                    <button
                      className="bg-transparent py-2 flex gap-2 border text-xs text-white px-4 rounded"
                      onClick={(e) => handleApproval(entry, e)}
                    >
                      <CheckCheck className="w-4 h-4 text-[#017a5b]" />
                      Approve
                    </button>
                    <button
                      className="bg-transparent border flex gap-2 text-white px-4 py-2 text-xs rounded"
                      onClick={(e) => handleReject(entry, e)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                      Reject
                    </button>
                    <button
                      className="bg-transparent flex gap-2 text-white px-4 py-2 text-xs rounded"
                      onClick={(e) => openDeleteDialog(entry._id, e)} // Trigger confirmation dialog
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    {/* Delete Confirmation Dialog */}
                    <DeleteConfirmationDialog
                      isOpen={isDeleteDialogOpen}
                      onClose={() => setIsDeleteDialogOpen(false)}
                      onConfirm={confirmDelete} // Confirm delete action
                      title="Confirm Delete"
                      description="Are you sure you want to delete this regularization request? This action cannot be undone."
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Custom Date Range Modal */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="w-[33.33%]">
          <div className="flex justify-between">
            <DialogTitle className="text-md font-medium mb-4 text-white">Select Custom Date Range</DialogTitle>
            <DialogClose className="h-8 scale-75">X</DialogClose>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customDateRange.start && customDateRange.end) {
                handleCustomDateSubmit(customDateRange.start, customDateRange.end);
              }
            }}
            className="space-y-4"
          >
            {/* Start Date Picker Button */}
            <div>
              <h1 className="absolute bg-[#1A1C20] ml-2 text-xs font-medium text-white">Start Date</h1>
              <button
                type="button"
                className="text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                onClick={() => setIsStartPickerOpen(true)} // Open start date picker
              >
                {customDateRange.start
                  ? new Date(customDateRange.start).toLocaleDateString('en-GB') // Format date as dd/mm/yyyy
                  : 'Select Start Date'}
              </button>
            </div>

            {/* End Date Picker Button */}
            <div>
              <h1 className="absolute bg-[#1A1C20] ml-2 text-xs font-medium text-white">End Date</h1>
              <button
                type="button"
                className="text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                onClick={() => setIsEndPickerOpen(true)} // Open end date picker
              >
                {customDateRange.end
                  ? new Date(customDateRange.end).toLocaleDateString('en-GB') // Format date as dd/mm/yyyy
                  : 'Select End Date'}
              </button>
            </div>

            {/* Submit Button */}
            <div>
              <button type="submit" className="bg-[#017A5B] text-white py-2 px-4 rounded w-full text-xs">
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

      {/* Regularization Details Sheet */}
      {selectedEntry && isRegularizationDetailsOpen && isRegularization(selectedEntry) && (
        <RegularizationDetails
          selectedRegularization={selectedEntry} // This will only work if selectedEntry is Regularization
          onClose={() => setIsRegularizationDetailsOpen(false)} // Close sheet
        />
      )}

      {/* Approval Modal */}
      {selectedEntry && isModalOpen && isRegularization(selectedEntry) && (
        <RegularizationApprovalModal
          regularizationId={selectedEntry._id}
          timestamp={selectedEntry.timestamp}
          loginTime={selectedEntry.loginTime}
          logoutTime={selectedEntry.logoutTime}
          remarks={selectedEntry.remarks}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Reject Modal */}
      {selectedEntry && isRejectModalOpen && isRegularization(selectedEntry) && (
        <RegularizationRejectModal
          regularizationId={selectedEntry._id}
          remarks={remarks}
          setRemarks={setRemarks}
          onClose={handleModalClose}
          onSubmit={handleRejectSubmit}
        />
      )}
    </div>
  );
}
