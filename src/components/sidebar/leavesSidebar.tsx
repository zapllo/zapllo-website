'use client'
// components/BillingSidebar.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { CalendarCheck, CalendarCheck2, CalendarMinus, CalendarMinus2Icon, CalendarX, File, Grid, Grid2X2, Settings, Stamp, Wallet } from 'lucide-react';

const LeavesSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className="w-48 mt-12 border-r fixed overflow-y-scroll scrollbar-hide bg-[#201024] text-white h-screen">
            <div className='space-y-4'>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/attendance') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg mt-6 gap-2 px-4 h-8  justify-start hover:bg-[#75517B] hover:rounded-lg bg-transparent mb-2 ${isActive('/attendance') ? 'bg-[#75517B] h-8 hover:bg-[#75517B] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/attendance')}
                    >
                        <Grid2X2 className='h-5' /> Dashboard
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/dashboard/billing/wallet-logs') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg gap-2 px-4 h-8 bg-transparent justify-start hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] h-8 hover:bg-[#75517B] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/dashboard/billing/wallet-logs')}
                    >
                        <CalendarCheck className='h-5' /> My Attendance
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/dashboard/billing/wallet-logs') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] hover:bg-[#75517B] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/dashboard/billing/wallet-logs')}
                    >
                        <CalendarMinus className='h-5' /> My Leaves
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/dashboard/billing/wallet-logs') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] hover:bg-[#75517B] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/dashboard/billing/wallet-logs')}
                    >
                        <CalendarX className='h-5' /> Holidays
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/dashboard/billing/wallet-logs') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] hover:bg-[#75517B] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/dashboard/billing/wallet-logs')}
                    >
                        <Stamp className='h-5' /> Approvals
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/dashboard/billing/wallet-logs') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] hover:bg-[#75517B] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/dashboard/billing/wallet-logs')}
                    >
                        <CalendarMinus2Icon className='h-5' /> All Leaves
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/dashboard/billing/wallet-logs') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg gap-2 px-4 bg-transparent justify-start hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] hover:bg-[#75517B] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/dashboard/billing/wallet-logs')}
                    >
                        <CalendarCheck2 className='h-5' /> All Attendance
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/attendance/settings') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg gap-2 h-8 px-4 bg-transparent justify-start hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/attendance/settings') ? 'bg-[#75517B] h-8 hover:bg-[#75517B] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/attendance/settings')}
                    >
                        <Settings className='h-5' /> Settings
                    </Button>
                </div>
                {/* <div className='flex justify-center'>
                    <Button
                        variant={isActive('/active-plan') ? 'default' : 'default'}
                        className={`w-[90%] rounded-none gap-2 px-4 bg-transparent justify-start hover:bg-transparent mb-2 ${isActive('/active-plan') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/active-plan')}
                    >
                        Active Plan
                    </Button>
                </div> */}
            </div>
        </div>
    );
};

export default LeavesSidebar;
