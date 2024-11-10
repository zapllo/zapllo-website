// pages/holidayManager.tsx
"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Plus, X } from "lucide-react";
import HolidayForm from "@/components/forms/HolidayForm"; // Ensure you have this component to create holidays
import HolidayList from "@/components/lists/HolidayList"; // Ensure you have this component to display holidays
import { toast, Toaster } from "sonner";
import { CrossCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const HolidayManager: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Control the modal state
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isLeaveAccess, setIsLeaveAccess] = useState<boolean | null>(null);
  const router = useRouter();

  const handleHolidayCreated = () => {
    setIsModalOpen(false); // Close modal after holiday is created
    toast.success("Holiday added successfully!");
    window.location.reload(); // Refresh the page to fetch the updated holiday list
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("/api/users/me"); // Adjust this endpoint to fetch user data
        if (response.data && response.data.data.role) {
          setCurrentUserRole(response.data.data.role);
          setIsLeaveAccess(response.data.data.isLeaveAccess);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);


  useEffect(() => {
    if (isLeaveAccess === false) {
      router.push('/dashboard')
    }
  }, [])



  return (
    <div className="container mx-auto p-6">
                  {/* <Toaster /> */}
      {/* <h2 className="text-lg font-bold mb-6">Holiday Manager</h2> */}

      {/* Dialog Root */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {currentUserRole === "orgAdmin" && (
          <div className="flex justify-start ml-5">
            <DialogTrigger asChild>
              <button
                className="hover:bg-[#] border-2 border-[#] text-white text-xs px-2 py-2 rounded flex items-center gap-2"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircledIcon className="h-4 w-4" /> Add New Holiday
              </button>
            </DialogTrigger>
          </div>
        )}

        {/* Modal Content */}

        <DialogContent className=" z-[100]  flex items-center justify-center">
          <div className="bg-[#0b0d29] w-full max-w-lg overflow-y-scroll scrollbar-hide h-fit max-h-[600px]  shadow-lg   rounded-lg">
            <div className="flex border-b py-2  w-full justify-between">
              <DialogTitle className="text-md   px-6 py-2 font-medium">
                Add New Holiday
              </DialogTitle>
              <DialogClose className=" px-6 py-2">
                <CrossCircledIcon className="scale-150 mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
              </DialogClose>
            </div>
            <div className="relative">
              <HolidayForm onHolidayCreated={handleHolidayCreated} />{" "}
              {/* Holiday Form Component */}
            </div>
            <div className="flex justify-end mt-4"></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Holiday List */}
      <div className="mt-6">
        <HolidayList /> {/* Holiday List Component to display holidays */}
      </div>
    </div >
  );
};

export default HolidayManager;
