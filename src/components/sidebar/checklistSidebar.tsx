// components/Sidebar.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { IconChecklist, IconSportBillard, IconTallymarks } from '@tabler/icons-react';
import { Calendar, CheckCircleIcon, File, PlusCircle, Ticket, Video, Wallet } from 'lucide-react';
import { VideoIcon } from '@radix-ui/react-icons';

const ChecklistSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className="w-52 -mt-12 bg-[#201024] fixed text-white h-screen ">
            <div className='space-y-4'>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/dashboard/checklist') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg mt-6 gap-2 px-4  py-1 justify-start hover:rounded-lg hover:bg-[#75517B] bg-transparent mb-2 ${isActive('/dashboard/checklist') ? 'bg-[#75517B] py-1 hover:bg-[#75517B] rounded-lg text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/dashboard/checklist')}
                    >
                        <CheckCircleIcon className='h-5' /> Checklist
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/tutorials') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg  gap-2 px-4  bg-transparent justify-start py-1 hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] py-1 text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/tutorials')}
                    >
                        <Video className='h-5' /> Tutorials
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/dashboard/checklist/events') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg  gap-2 py-1 px-4 bg-transparent justify-start hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] py-1 text-white' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/dashboard/events')}
                    >
                        <Calendar className='h-5' /> Events
                    </Button>
                </div>
                <div className='flex justify-center'>
                    <Button
                        variant={isActive('/dashboard/tickets') ? 'default' : 'default'}
                        className={`w-[90%] rounded-lg py-1  gap-2  h-10  px-4 bg-transparent justify-start hover:bg-[#75517B] hover:rounded-lg mb-2 ${isActive('/dashboard/tickets') ? 'bg-[#75517B] py-1 hover:bg-[#75517B] text-white rounded-lg' : 'text-gray-400'}`}
                        onClick={() => handleNavigation('/dashboard/tickets')}
                    >
                        <Ticket className='h-5' /> Tickets
                    </Button>
                </div>

                {/* <Button
                    variant={isActive('/dashboard/tickets') ? 'default' : 'default'}
                    className={`w-full rounded-none  gap-2 px-4 bg-transparent justify-start hover:bg-transparent mb-2 ${isActive('/dashboard/tickets') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                    onClick={() => handleNavigation('/dashboard/tickets')}
                >
                    <PlusCircle className='h-5' /> Raise a Ticket
                </Button> */}
                {/* <Button
                    variant={isActive('/active-plan') ? 'default' : 'default'}
                    className={`w-full rounded-none  gap-2 bg-transparent justify-start hover:bg-transparent mb-2 ${isActive('/dashboard/wallet-logs') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                    onClick={() => handleNavigation('/active-plan')}
                >
                    Active Plan
                </Button> */}
            </div>
        </div >
    );
};

export default ChecklistSidebar;