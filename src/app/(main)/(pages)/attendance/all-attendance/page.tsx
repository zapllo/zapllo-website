'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import RegularizationApprovalModal from '@/components/modals/regularizationApprovalModal';
import RegularizationRejectModal from '@/components/modals/rejectRegularizationModal';


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
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvalRemarks?: string;
};

type Regularization = {
  _id: string;
  userId: User;
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

export default function AllAttendance() {
  const [attendanceEntries, setAttendanceEntries] = useState<Attendance[]>([]);
  const [regularizations, setRegularizations] = useState<Regularization[]>([]);
  const [filter, setFilter] = useState<'Attendance' | 'Regularization'>('Attendance'); // For Attendance and Regularization tab
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [selectedEntry, setSelectedEntry] = useState<Attendance | Regularization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [remarks, setRemarks] = useState<string>(''); // For storing rejection remarks

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        if (filter === 'Attendance') {
          const response = await axios.get('/api/all-attendance');
          if (response.data.success) {
            setAttendanceEntries(response.data.attendance);
          }
        } else if (filter === 'Regularization') {
          const response = await axios.get('/api/all-regularization-approvals');
          if (response.data.success) {
            setRegularizations(response.data.regularizations);
          }
        }
      } catch (error: any) {
        console.error(`Error fetching ${filter} entries:`, error.response?.data || error.message);
        alert(`Failed to fetch ${filter} entries: ${error.response?.data?.message || error.message}`);
      }
    };

    fetchEntries();
  }, [filter]);

  const handleApproval = (entry: Attendance | Regularization) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);  // Open the approval modal
  };

  const handleReject = (entry: Attendance | Regularization) => {
    setSelectedEntry(entry);
    setIsRejectModalOpen(true);  // Open the rejection modal
  };

  const handleRejectSubmit = async () => {
    if (!remarks) {
      alert('Please enter remarks for rejection.');
      return;
    }
    try {
      if (!selectedEntry) return;

      const response = await axios.patch(`/api/${filter === 'Attendance' ? 'attendance' : 'regularization'}/${selectedEntry._id}/reject`, {
        remarks,
      });

      if (response.data.success) {
        const updatedEntries = await axios.get(filter === 'Attendance' ? '/api/all-attendance' : '/api/all-regularization-approvals');
        filter === 'Attendance' ? setAttendanceEntries(updatedEntries.data.attendance) : setRegularizations(updatedEntries.data.regularizations);
        setIsRejectModalOpen(false);
        setSelectedEntry(null);
        setRemarks('');  // Clear remarks
      } else {
        throw new Error(response.data.message || 'Failed to reject.');
      }
    } catch (error: any) {
      console.error(`Error rejecting ${filter}:`, error.response?.data || error.message);
      alert(`Failed to reject ${filter}.`);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsRejectModalOpen(false);
    setSelectedEntry(null);
    setRemarks('');
  };

  const handleModalSubmit = async () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
    // Refetch data after approval
    try {
      const response = await axios.get(filter === 'Attendance' ? '/api/all-attendance' : '/api/all-regularization-approvals');
      filter === 'Attendance' ? setAttendanceEntries(response.data.attendance) : setRegularizations(response.data.regularizations);
    } catch (error: any) {
      console.error(`Error refetching ${filter} entries:`, error.response?.data || error.message);
    }
  };

  const filteredEntries = (filter === 'Attendance' ? attendanceEntries : regularizations).filter(
    entry => statusFilter === 'All' || entry.approvalStatus === statusFilter
  );

  const pendingCount = (filter === 'Attendance' ? attendanceEntries : regularizations).filter(entry => entry.approvalStatus === 'Pending').length;
  const approvedCount = (filter === 'Attendance' ? attendanceEntries : regularizations).filter(entry => entry.approvalStatus === 'Approved').length;
  const rejectedCount = (filter === 'Attendance' ? attendanceEntries : regularizations).filter(entry => entry.approvalStatus === 'Rejected').length;

  return (
    <div className="container mx-auto p-6">
      {/* Tabs for Attendance and Regularization */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setFilter('Attendance')}
          className={`px-4 text-xs h-8 rounded ${filter === 'Attendance' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
        >
          All Attendance
        </button>
        <button
          onClick={() => setFilter('Regularization')}
          className={`px-4 text-xs h-8 rounded ${filter === 'Regularization' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
        >
          All Regularizations
        </button>
      </div>

      {/* Filter Buttons for status */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-4 text-xs h-8 rounded ${statusFilter === 'All' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
        >
          All ({filter === 'Attendance' ? attendanceEntries.length : regularizations.length})
        </button>
        <button
          onClick={() => setStatusFilter('Pending')}
          className={`px-4 text-xs h-8 rounded ${statusFilter === 'Pending' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter('Approved')}
          className={`px-4 text-xs h-8 rounded ${statusFilter === 'Approved' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setStatusFilter('Rejected')}
          className={`px-4 text-xs h-8 rounded ${statusFilter === 'Rejected' ? 'bg-[#7c3987] text-white' : 'bg-[#28152e] text-white'}`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Entries Display */}
      {filteredEntries.length === 0 ? (
        <p className="text-gray-600">No {filter.toLowerCase()} records found.</p>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div key={entry._id} className="flex items-center justify-between border p-4 rounded shadow-sm mb-4">
              <div className="flex items-center gap-4">
                <div className="h-6 w-6 rounded-full bg-[#7c3987] flex items-center justify-center text-white text-sm">
                  {entry.userId.firstName[0]}
                </div>
                <h3 className="text-md text-white">{entry.userId.firstName}</h3>
                <p className="text-sm text-white">
                  {filter === 'Attendance'
                    ? `Action: ${entry.action === 'login' ? 'Login' : 'Logout'} on `
                    : `Regularization on `}
                  <span className="text-white">{format(new Date(entry.timestamp), 'MMM d, yyyy')}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {entry.approvalStatus === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleApproval(entry)}
                      className="bg-green-500 text-xs text-white px-4 py-2 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(entry)}
                      className="bg-red-500 text-xs text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
                <span className={`px-3 py-1 rounded-full text-sm ${entry.approvalStatus === 'Pending' ? 'bg-yellow-500 text-white' :
                  entry.approvalStatus === 'Approved' ? 'bg-green-500 text-white' :
                    'bg-red-500 text-white'}`}>
                  {entry.approvalStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {selectedEntry && isModalOpen && (
        <RegularizationApprovalModal
          regularizationId={(selectedEntry as Regularization)._id}
          timestamp={(selectedEntry as Regularization).timestamp}
          loginTime={(selectedEntry as Regularization).loginTime}
          logoutTime={(selectedEntry as Regularization).logoutTime}
          remarks={(selectedEntry as Regularization).remarks}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Reject Modal */}
      {selectedEntry && isRejectModalOpen && (
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
