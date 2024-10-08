'use client';

import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';

type LeaveType = {
  _id: string;
  leaveType: string;
  allotedLeaves: number; // Allotted leave balance for each leave type
};

type LeaveBalance = {
  leaveType: LeaveType;
  leaveTypeId: string;
  balance: number;
  userLeaveBalance: number;
};

type User = {
  userId: string;
  firstName: string;
  lastName: string;
  leaveBalances: LeaveBalance[];
};

interface EditLeaveBalanceModalProps {
  user: User;
  leaveTypes: LeaveType[]; // All available leave types with allotted leave balances
  onClose: () => void;
  onSubmit: (updatedLeaveBalances: LeaveBalance[]) => Promise<void>;
}

const EditLeaveBalanceModal: React.FC<EditLeaveBalanceModalProps> = ({
  user,
  leaveTypes,
  onClose,
  onSubmit,
}) => {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({}); // Track errors for each leave type

  useEffect(() => {
    // Initialize the leaveBalances state with the user's balances or default to 0
    const initialBalances: LeaveBalance[] = leaveTypes.map((leaveType) => {
      const existingBalance = user.leaveBalances.find(
        (lb) => lb.leaveTypeId === leaveType._id
      );
      return {
        leaveType: leaveType, // Include the leaveType object
        leaveTypeId: leaveType._id,
        balance: existingBalance ? existingBalance.balance : 0,
        userLeaveBalance: existingBalance ? existingBalance.userLeaveBalance : 0,
      };
    });
    setLeaveBalances(initialBalances);
  }, [user, leaveTypes]);

  const handleBalanceChange = (leaveTypeId: string, newBalance: number) => {
    // Get the allotted leave balance for this leave type
    const leaveType = leaveTypes.find((lt) => lt._id === leaveTypeId);

    if (leaveType) {
      if (newBalance > leaveType.allotedLeaves) {
        // Set an error message if new balance exceeds the allotted balance
        setErrors((prev) => ({
          ...prev,
          [leaveTypeId]: `Cannot exceed allotted leave of ${leaveType.allotedLeaves}`,
        }));
      } else {
        // Clear the error if valid
        setErrors((prev) => ({
          ...prev,
          [leaveTypeId]: '',
        }));
        // Update the balance
        const updatedBalances = leaveBalances.map((lb) =>
          lb.leaveTypeId === leaveTypeId
            ? { ...lb, userLeaveBalance: newBalance }
            : lb
        );
        setLeaveBalances(updatedBalances);
      }
    }
  };

  const handleSubmit = () => {
    // Prevent submission if there are any validation errors
    const hasErrors = Object.values(errors).some((error) => error !== '');
    if (!hasErrors) {
      onSubmit(leaveBalances);
      toast.success('Balance updated successfully!');
    } else {
      alert('Please fix the errors before submitting.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Toaster />
      <div className="bg-[#1a1c20] p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between">
          <h2 className="text-md font-bold mb-4">Update Leave Balance </h2>
          <button onClick={onClose} className="px-4 py-2 rounded">
            <X className="w-4 -mt-2 h-4" />
          </button>
        </div>
        <div className="flex justify-start py-2 w-full">
          <div className="flex-shrink-0 flex gap-2">
            <div className="h-6 w-6 rounded-full bg-[#7c3987] flex items-center justify-center text-white text-sm">
              {user.firstName?.[0]}
            </div>
            <h1 className="text-sm mt-[2px]">
              {user.firstName} {user.lastName}
            </h1>
          </div>
        </div>
        <div>
          <table className="min-w-full mt-2 border-collapse table-auto">
            <tbody>
              {leaveTypes.map((leaveType) => (
                <tr key={leaveType._id}>
                  <td className="px-4 py-2 text-xs">{leaveType.leaveType}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={
                        leaveBalances.find(
                          (lb) => lb.leaveTypeId === leaveType._id
                        )?.userLeaveBalance ?? 0
                      }
                      onChange={(e) =>
                        handleBalanceChange(
                          leaveType._id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="p-2 w-full text-xs outline-none"
                    />
                    {/* Display validation error if it exists */}
                    {errors[leaveType._id] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[leaveType._id]}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="bg-[#017A5B] w-full text-sm text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveBalanceModal;
