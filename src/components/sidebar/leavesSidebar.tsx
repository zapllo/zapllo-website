'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import {
    CalendarCheck,
    CalendarMinus,
    CalendarX,
    CalendarCheck2,
    Grid2X2,
    Stamp,
    Settings,
    CalendarMinus2Icon
} from 'lucide-react';

const LeavesSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('/api/users/me');
                setUserRole(response.data.data.role); // Assuming the role is in response.data.data.role
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, []);

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const isActive = (path: string) => pathname === path;

    // Conditional rendering for orgAdmin only
    const isOrgAdmin = userRole === 'orgAdmin';
    // Conditional rendering for non-member roles (e.g., admin, manager)
    const isAdminOrManager = userRole && userRole !== 'member';

    return (
        <div className="w-48 mt-12 border-r fixed overflow-y-scroll scrollbar-hide bg-[#201024] text-white h-screen">
            <div className='space-y-4'>
                <div className='flex justify-center'>
                    <Button
                        className={`w-[90%] rounded-lg mt-6 gap-2 px-4 h-8 justify-start hover:bg-[#75517B] bg-transparent mb-2 ${isActive('/attendance') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/attendance')}
                    >
                        <Grid2X2 className='h-5' /> Dashboard
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        className={`w-[90%] rounded-lg gap-2 px-4 h-8 justify-start hover:bg-[#75517B] bg-transparent mb-2 ${isActive('/attendance/my-attendance') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/attendance/my-attendance')}
                    >
                        <CalendarCheck className='h-5' /> My Attendance
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] mb-2 ${isActive('/attendance/my-leaves') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/attendance/my-leaves')}
                    >
                        <CalendarMinus className='h-5' /> My Leaves
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] mb-2 ${isActive('/attendance/holidays') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/attendance/holidays')}
                    >
                        <CalendarX className='h-5' /> Holidays
                    </Button>
                </div>

                {/* Show Approvals for non-members (admin/manager) */}
                {isAdminOrManager && (
                    <div className='flex justify-center'>
                        <Button
                            className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] mb-2 ${isActive('/attendance/approvals') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                            onClick={() => handleNavigation('/attendance/approvals')}
                        >
                            <Stamp className='h-5' /> Approvals
                        </Button>
                    </div>
                )}

                {/* Show the following only for orgAdmin */}
                {isOrgAdmin && (
                    <>
                        <div className='flex justify-center'>
                            <Button
                                className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] mb-2 ${isActive('/attendance/all-leaves') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                                onClick={() => handleNavigation('/attendance/all-leaves')}
                            >
                                <CalendarMinus2Icon className='h-5' /> All Leaves
                            </Button>
                        </div>
                        <div className='flex justify-center'>
                            <Button
                                className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                                onClick={() => handleNavigation('/dashboard/billing/wallet-logs')}
                            >
                                <CalendarCheck2 className='h-5' /> All Attendance
                            </Button>
                        </div>
                        <div className='flex justify-center'>
                            <Button
                                className={`w-[90%] rounded-lg gap-2 h-8 px-4 bg-transparent justify-start hover:bg-[#75517B] mb-2 ${isActive('/attendance/settings') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                                onClick={() => handleNavigation('/attendance/settings')}
                            >
                                <Settings className='h-5' /> Settings
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LeavesSidebar;