'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { settingsOptions } from '@/lib/constants'
import clsx from 'clsx'
import { Separator } from '@/components/ui/separator'
import { Database, GitBranch, LucideMousePointerClick } from 'lucide-react'
import axios from 'axios'
// import { ModeToggle } from '../global/mode-toggle'
// import { ModeToggle } from '../global/mode-toggle'

type Props = {}

const SettingsOptions = (props: Props) => {
    const pathName = usePathname()
    const [role, setRole] = useState("");

    useEffect(() => {
        const getUserDetails = async () => {
            const res = await axios.get('/api/users/me');
            const user = res.data.data;
            setRole(user.role);
        };
        getUserDetails();
    }, []);

    const filteredSettingsOptions = settingsOptions.filter(menuItem => {
        return role !== 'member' && role !== 'manager' || menuItem.name !== 'Categories';
    });

    return (
        <nav className=" dark:bg-[#05071E] w-fit  h-screen  overflow-scroll scrollbar-hide  justify-between flex items-center flex-col rounded-b-full rounded-r-xl  gap-10 py-4 px-4">
            <div className="flex items-center justify-center flex-col gap-8">
                {/* <Link
                    className="flex font-bold flex-row "
                    href="/"
                >
                    <img src='/Favicon.png' className='h-10 w-10' />
                </Link> */}
                <div>
                    {filteredSettingsOptions.map((menuItem) => (
                        <ul key={menuItem.name}>
                            <div>
                                <div className='flex space-y-4 mt-4 w-full'>
                                    <li className='flex w-full'>
                                        {/* 
                                            className={clsx(
                                                'group h-8 w-8 flex items-center justify-center  scale-[1.5] rounded-lg p-[3px]  cursor-pointer',
                                                {
                                                    'dark:bg-gradient-to-r from-[#A587FF]  to-[#5E29FF]  bg-[#EEE0FF] ':
                                                        pathName === menuItem.href,
                                                }
                                            )}
                                        >
                                        </Link> */}
                                    </li>
                                    <Link
                                        href={menuItem.href}>
                                        <div
                                            className={clsx(
                                                'bg-black/10 flex gap-4 px-12 py-2 cursor-pointer  backdrop-blur-xl',
                                                {
                                                    'dark:bg-gradient-to-r from-[#A587FF] px-16 py-2 rounded-r-xl w-full   to-[#5E29FF]  bg-[#EEE0FF] ':
                                                        pathName === menuItem.href,
                                                }
                                            )}
                                        >
                                            <menuItem.Component className='mt-1'
                                                selected={pathName === menuItem.href}
                                            />
                                            <p className='text-center'>{menuItem.name}</p>

                                        </div>
                                    </Link>
                                </div>

                            </div>
                        </ul>
                    ))}
                </div>
                <Separator />
                {/* <div className="flex items-center flex-col gap-9 dark:bg-[#353346]/30 py-4 px-2 rounded-full overflow-scroll scrollbar-hide border-[1px]">
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <LucideMousePointerClick
              className="dark:text-white"
              size={18}
            />
            <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]" />
          </div>
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <GitBranch
              className="text-muted-foreground"
              size={18}
            />
            <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]"></div>
          </div>
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <Database
              className="text-muted-foreground"
              size={18}
            />
            <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]"></div>
          </div>
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <GitBranch
              className="text-muted-foreground"
              size={18}
            />
          </div>
        </div> */}
            </div>
            <div className="flex items-center justify-center flex-col gap-8">
                {/* <ModeToggle /> */}
            </div>
        </nav >
    )
}

export default SettingsOptions
