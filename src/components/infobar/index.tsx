'use client'
import React, { useEffect, useState } from 'react'
import { Book, Headphones, LogOutIcon, Search, User } from 'lucide-react'
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
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { ModeToggle } from '../globals/mode-toggle'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

type Props = {}

const InfoBar = (props: Props) => {
  const router = useRouter();
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

  return (
    <>
      <div className="flex flex-row justify-between gap-6 items-center px-4 py-4 w-full dark:bg-[#05071E] ">
        <div className='flex ml-4'>
          <h1 className='text-xl font-bold mt-1'>Hello, {firstName} 👋 </h1>
        </div>
        <div className="flex items-center gap-2 font-bold">
          <h1 className='text-sm mt-2'>Access Expires in <span className='text-red-500 font-bold'>{remainingTime || 'Loading...'}</span></h1>
          <Link href='/dashboard/billing'>
            <Button className='h-7 bg-white text-black hover:text-white mt-1'>👑 Upgrade to Pro</Button>
          </Link>
          <ModeToggle />
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Headphones />
              </TooltipTrigger>
              <TooltipContent>
                <p>Contact Support</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className='h-8 items-center cursor-pointer flex justify-center w-8 border bg-purple-500 rounded-full mt-1'>
                <User className='h-5 w-5' />
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
