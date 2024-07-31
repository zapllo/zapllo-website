'use client'
import React, { useEffect, useState } from 'react'
import { Bell, BellDot, Book, Headphones, LogOutIcon, Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { ModeToggle } from '../globals/mode-toggle'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { BellIcon } from '@radix-ui/react-icons'

type Props = {}

const InfoBar = (props: Props) => {
  const router = useRouter();
  const pathName = usePathname();
  const [firstName, setFirstName] = useState("User");
  const [lastName, setLastName] = useState("User");
  const [role, setRole] = useState("role");
  const [trialExpires, setTrialExpires] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userRes = await axios.get('/api/users/me');
        setFirstName(userRes.data.data.firstName);
        setLastName(userRes.data.data.lastName);
        setRole(userRes.data.data.role);

        // Fetch trial status
        const trialStatusRes = await axios.get('/api/organization/trial-status');
        const isExpired = trialStatusRes.data.isExpired;
        setTrialExpires(isExpired ? null : trialStatusRes.data.trialExpires);
      } catch (error) {
        console.error('Error fetching user details or trial status:', error);
      }
    }
    getUserDetails();
  }, [])

  useEffect(() => {
    if (trialExpires) {
      // Calculate remaining time
      const calculateRemainingTime = () => {
        const now = new Date();
        const distance = formatDistanceToNow(new Date(trialExpires), { addSuffix: true });
        setRemainingTime(distance);
      };

      calculateRemainingTime();
      const intervalId = setInterval(calculateRemainingTime, 1000 * 60); // Update every minute

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [trialExpires]);

  console.log(remainingTime, 'time?')

  const logout = async () => {
    try {
      await axios.get('/api/users/logout');
      router.push('/login')
    } catch (error: any) {
      console.log(error.message)
    }
  }

  const getPageTitle = () => {
    if (pathName === '/dashboard') {
      return 'Dashboard';
    } else if (pathName === '/dashboard/tasks') {
      return 'Task Management';
    } else if (pathName === '/dashboard/teams') {
      return 'Teams';
    }
    else if (pathName === '/dashboard/settings') {
      return 'Settings';
    } else if (pathName === '/dashboard/settings/categories') {
      return 'Categories';
    } else if (pathName === '/dashboard/billing') {
      return 'Billing';
    }
  };

  return (
    <>
      <div className="flex flex-row justify-between gap-6 items-center px-4 py-4 w-full z-[20]   bg-[#211025] ">
        {/* <img src='/icons/ellipse.png' className='absolute h-[50%] z-[10]   opacity-30 -ml-32 ' /> */}
        <div className='flex ml-4'>
          <h1 className='text-xl  mt-1  text-white font-bold'>{getPageTitle()} </h1>
        </div>
        <div className="flex items-center gap-4 font-bold">
          <h1 className='text-sm mt- '>Access Expires in <span className='text-red-500 font-bold'>{remainingTime || 'Loading...'}</span></h1>
          <Link href='/dashboard/billing'>
            <Button className='h-8 dark:bg-[#007A5A] text-xs text-white'>Upgrade Now</Button>
          </Link>
          <ModeToggle />
          <Button

            className='relative rounded-full bg-[#75517B] p-2 h-10 w-10'
            size="icon"
          >
            <img src='/icons/bell.png' className='' alt="Notification Bell" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-red-500 "></span>
          </Button>
          {/* <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Headphones />
              </TooltipTrigger>
              <TooltipContent>
                <p>Contact Support</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <div className='flex gap-4'>
              <div className='h-10  items-center cursor-pointer flex justify-center w-10 border bg-[#75517B] -500 rounded-full '>
                {/* <User className='h-5 w-5' />
               */}
              
              {`${firstName}`.slice(0,1)}
              </div>
              <div>
                <h1 className='text-[#fd8829] text-sm '>
                  {firstName}
                </h1>
                {role === "orgAdmin" ? <h1 className='absolute text-xs '>Admin</h1> : role === "manager" ? <h1>Manager</h1> : <h1>Member</h1>}
              </div>
            </div>
            </DropdownMenuTrigger>
           
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>{firstName} {lastName}
                <p className='text-xs text-gray-400 capitalize'>Team {role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  Profile
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Billing
                  <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                </DropdownMenuItem>

              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                Log out
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}

export default InfoBar
