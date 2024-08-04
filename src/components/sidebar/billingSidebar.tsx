// components/Sidebar.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { IconSportBillard, IconTallymarks } from '@tabler/icons-react';
import { File, Wallet } from 'lucide-react';

const BillingSidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className="w-64 border-r  bg-[#201024] text-white h-screen ">
            <div className='space-y-4'>
                <Button
                    variant={isActive('/dashboard/billing') ? 'default' : 'default'}
                    className={`w-full rounded-none mt-6 gap-2 px-4  justify-start bg-transparent mb-2 ${isActive('/dashboard/billing') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                    onClick={() => handleNavigation('/dashboard/billing')}
                >
                    <File className='h-5' /> Billing
                </Button>
                <Button
                    variant={isActive('/dashboard/billing/wallet-logs') ? 'default' : 'default'}
                    className={`w-full rounded-none  gap-2 px-4 bg-transparent justify-start hover:bg-transparent mb-2 ${isActive('/dashboard/billing/wallet-logs') ? 'bg-[#75517B] text-white' : 'text-gray-400'}`}
                    onClick={() => handleNavigation('/dashboard/billing/wallet-logs')}
                >
                    <Wallet className='h-5' /> Wallet Logs
                </Button>
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

export default BillingSidebar;
