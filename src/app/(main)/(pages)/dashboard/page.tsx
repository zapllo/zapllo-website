"use client";

import { ShiningButton } from "@/components/globals/shiningbutton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Loader from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { CalendarMinus, Globe, Home, Megaphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const DashboardPage = () => {
  const [progress, setProgress] = useState<boolean[]>([]);
  const [userId, setUserId] = useState("");
  const [leavesTrialExpires, setLeavesTrialExpires] = useState(Date());
  const [attendanceTrialExpires, setAttendanceTrialExpires] = useState(Date());
  const [role, setRole] = useState<string | null>(null); // Track the user's role
  const router = useRouter();
  const [leavesRemainingTime, setLeavesRemainingTime] = useState("");
  const [attendanceRemainingTime, setAttendanceRemainingTime] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Global loading state
  const [isFreeTrialLoading, setFreeTrialLoading] = useState(true);

  useEffect(() => {
    if (leavesTrialExpires) {
      const calculateLeavesRemainingTime = () => {
        const now = new Date();
        const distance = formatDistanceToNow(new Date(leavesTrialExpires), {
          addSuffix: true,
        });
        setLeavesRemainingTime(distance);
      };
      calculateLeavesRemainingTime();
      const leavesInterval = setInterval(
        calculateLeavesRemainingTime,
        1000 * 60
      ); // Update every minute
      return () => clearInterval(leavesInterval);
    }
  }, [leavesTrialExpires]);

  useEffect(() => {
    if (attendanceTrialExpires) {
      const calculateAttendanceRemainingTime = () => {
        const now = new Date();
        const distance = formatDistanceToNow(new Date(attendanceTrialExpires), {
          addSuffix: true,
        });
        setAttendanceRemainingTime(distance);
      };
      calculateAttendanceRemainingTime();
      const attendanceInterval = setInterval(
        calculateAttendanceRemainingTime,
        1000 * 60
      ); // Update every minute
      return () => clearInterval(attendanceInterval);
    }
  }, [attendanceTrialExpires]);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userRes = await axios.get("/api/users/me");
        setUserId(userRes.data.data._id);
        setRole(userRes.data.data.role); // Set role from the response

        // Redirect if the role is Admin
        if (userRes.data.data.role === "Admin") {
          router.replace("/admin/dashboard"); // Redirect to admin dashboard
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    getUserDetails();
  }, [router]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/get-checklist-progress?userId=${userId}`);
        const data = await res.json();
        setProgress(data.progress);
      } catch (error) {
        console.error("Error fetching checklist progress:", error);
      }
    };

    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  const calculateProgress = () => {
    if (!progress || progress.length === 0) return 0;
    const completedCount = progress.filter(Boolean).length;
    const progressPercentage = (completedCount / progress.length) * 100;
    return Math.round(progressPercentage); // Round to the nearest integer
  };

  const fetchTrialStatus = async () => {
    const response = await axios.get("/api/organization/getById");
    const { leavesTrialExpires, attendanceTrialExpires } = response.data.data;
    setLeavesTrialExpires(
      leavesTrialExpires && new Date(leavesTrialExpires) > new Date()
        ? leavesTrialExpires
        : null
    );
    setAttendanceTrialExpires(
      attendanceTrialExpires && new Date(attendanceTrialExpires) > new Date()
        ? attendanceTrialExpires
        : null
    );
    setIsLoading(false); // Data fetched, stop showing the global loader
  };

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  const startTrial = async (product: string) => {
    setFreeTrialLoading(true);
    try {
      const trialDate = new Date();
      trialDate.setDate(trialDate.getDate() + 7); // Set trial for 7 days
      await axios.post("/api/organization/start-trial", {
        product,
        trialExpires: trialDate,
      });
      // fetchTrialStatus(); // Refresh the trial status after starting the trial
    } catch (error) {
      console.error("Error starting trial:", error);
    } finally {
      setFreeTrialLoading(false);
    }
  };

  return (

    <div className=' dark:bg-[#04061e] mb-16 overflow-y-scroll
     pt-2 scale-95 mt-16 h-screen gap- relative overflow-x-hidden scrollbar-hide'>

      {/* <h1 className='text-xl gap-2 sticky top-0 z-[10] -mt-12   dark:bg-[#04071F] backdrop-blur-lg flex items-center border-b'>   <Home className='h-5' />  Dashboard
      </h1> */}
      <div className="w-full mb-2 flex">
        {calculateProgress() < 100 && (
          <div className=' w-[50.33%] flex justify-start gap-4'>
            <div className='p-4  w-full mx-4 rounded-xl  border border-[#E0E0E066]'>
              <div className='w-full'>
                <h1>Checklist </h1>
                <Progress value={calculateProgress()} className="" />
              </div>
              <div className='flex justify-start mt-3'>
                <Link href='/dashboard/checklist' >
                  <Button className='bg-[#815BF5] mt-12 hover:bg-[#815BF5]'>
                    Checklist
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className=' w-full h-48 flex justify-start gap-4'>
          <div className='p-4  w-full mx-4 rounded-xl  border border-[#E0E0E066]'>
            <div className='w-full p'>
              <h1 className='px-4 text-lg font-medium'>Tutorials </h1>
              <h1 className='px-4 py-4 text-sm'>Learn how to to get best out of our business workspace </h1>
              <Link href='/help/tutorials'>
                <Button className='bg-white text-black ml-4  hover:bg-white mt-6' >Go To Tutorials</Button></Link>
              <img src='/animations/tutorials.png' className='absolute h-48 ml-[45%] -mt-[150px]' />
            </div>
          </div>
        </div>
        {calculateProgress() == 100 && (
          <div className=' w-[50.33%] flex justify-start h-48 gap-4'>
            <div className='p-4  w-full mx-4 rounded-xl  border border-[#E0E0E066]'>
              <div className='w-full m'>
                <h1 className='text-lg font-medium flex gap-2'><Megaphone /> Events </h1>
                <p className='text-sm py-2'>We are bringing Live Classes to help you grow your business. Check out all our events to get the best out of our business workspace. </p>
                <div className="flex justify-start ">
                <Link href="/help/events">
                  <Button className="bg-white text-black mt-4 text-sm hover:bg-white ">
                    Go To Events
                  </Button>
                </Link>
              </div>
              </div>
             
            </div>
          </div>
        )}
      </div>
      <div className='grid grid-cols-3  '>
        <div className='flex  gap-4 '>
          <div className='p-4 w-full border border-[#E0E0E066] bg-[#]   m-4  text-white items-center flex justify-start rounded-xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/atask.png' className=' ml-[15px] mt-3 h-6     object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate Tasks</h1>
              <p className='text-xs font-medium'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#815BF5] py-1 hover:bg-[#815BF5] text-xs' >Go To Task Management</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className='flex  gap-4 '>
          <div className='p-4 w-full border border-[#E0E0E066] bg-[#]  m-4  text-white items-center flex justify-start rounded-xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <Globe className=' ml-[11px] mt-3 h-6     object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate Intranet</h1>
              <p className='text-xs font-medium'>Manage all your Important Company Links</p>
              <div className='pt-2'>
                <Link href='/intranet'>
                  <Button className='bg-[#815BF5] py-1 hover:bg-[#815BF5]  text-xs' >Go To Intranet</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex  gap-4 ">
          <div className="p-4 w-full border border-[#E0E0E066] bg-[#] m-4  text-white items-center flex justify-start rounded-xl ">
            <div className=" font-bold text-xl space-y-1">
              <div className="rounded-full h-12 border-[#E0E0E066] border w-12">
                <CalendarMinus className=" ml-[11px] mt-3 h-6     object-cover" />
              </div>
              <h1 className="text-lg font-medium">Automate Leaves</h1>
              <p className="text-xs font-medium">
                Manage your Employee Leaves & Holidays
              </p>
              <div className="">
                {leavesTrialExpires ? (
                  <>
                    <p className="text-xs text-red-600 py-2">
                      Free Trial Expires {leavesRemainingTime}
                    </p>
                    <Link href="/attendance/my-leaves">
                      <Button className="bg-[#815BF5] py-1 hover:bg-[#815BF5] text-xs">
                        Go To Leaves
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    onClick={() => startTrial("leaves")}
                    className="bg-[#815BF5] py-1 hover:bg-[#815BF5] text-xs"
                  >
                    {isFreeTrialLoading ? (
                      <span>Start trial</span>
                    ) : (
                      <>
                        <Loader /> <span>Starting trial...</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-3 mb-12 '>
        <div className='flex  gap-4 '>
          <div className='p-4 w-full border border-[#E0E0E066] bg-[#]  m-4  text-white items-center flex justify-start rounded-xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/attendance.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1 className="text-lg font-medium">Automate Attendance</h1>
              <p className="text-xs font-medium">
                Track your Team Attendance & Breaks
              </p>
              <div className="pt-">
                {attendanceTrialExpires ? (
                  <>
                    <p className="text-xs py-2 text-red-600 ">
                      Free Trial Expires {attendanceRemainingTime}
                    </p>
                    <Link href="/attendance/my-attendance">
                      <Button className="bg-[#815BF5] py-1 hover:bg-[#815BF5] text-xs">
                        Go To Attendance
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    onClick={() => startTrial("attendance")}
                    className="bg-[#815BF5] py-1 hover:bg-[#815BF5] text-xs"
                  >
                    {isFreeTrialLoading ? (
                      <>
                        <span>Start trial</span>
                      </>
                    ) : (
                      <>
                        {" "}
                        <Loader /> <span>Starting trial...</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='flex  gap-4 '>
          <div className='p-4 w-full border border-[#E0E0E066] bg-[]  m-4  text-white items-center flex justify-start rounded-xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/whatsapp.png' className=' ml-3 mt-[10px] h-6     object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate WA</h1>
              <p className='text-xs font-medium'>Get the Official Whatsapp API</p>
              <div className='pt-2'>
                <Link href='https://app.zapllo.com/signup'>
                  <Button className='bg-[#815BF5] py-1 hover:bg-[#815BF5]  text-xs' >Go To WhatsApp API</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className='flex  gap-4 '>
          <div className='p-4 w-full border border-[#E0E0E066] bg-[]  m-4  text-white items-center flex justify-start rounded-xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/crm.png' className=' ml-[10px] mt-3 h-6  invert-[100]    object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate CRM</h1>
              <p className='text-xs font-medium'>Track, Convert & Assign Leads to your Sales Team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#815BF5] py-1 hover:bg-[#815BF5] opacity-50 text-xs' >Coming Soon</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
