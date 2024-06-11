'use client'
import React, { useEffect, useState } from 'react'
// import { ModeToggle } from '../global/mode-toggle'
import { Book, Headphones, LogOutIcon, Search, User } from 'lucide-react'
import Templates from '../icons/cloud_download'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { getDate } from 'date-fns'
// import { UserButton } from '@clerk/nextjs'
// import { useBilling } from '@/providers/billing-provider'
// import { onPaymentDetails } from '@/app/(main)/(pages)/billing/_actions/payment-connecetions'

type Props = {}

const InfoBar = (props: Props) => {
  // const { credits, tier, setCredits, setTier } = useBilling()

  // const onGetPayment = async () => {
  //   const response = await onPaymentDetails()
  //   if (response) {
  //     setTier(response.tier!)
  //     setCredits(response.credits!)
  //   }
  // }

  // useEffect(() => {
  //   onGetPayment()
  // }, [])
  const router = useRouter();
  const [firstName, setFirstName] = useState("User");
  const [lastName, setLastName] = useState("User");
  const [role, setRole] = useState("role");
  const [trialExpires, setTrialExpires] = useState(new Date());
  const [remainingTime, setRemainingTime] = useState('');


  useEffect(() => {
    const getUserDetails = async () => {
      const res = await axios.get('/api/users/me')
      setFirstName(res.data.data.firstName);
      setLastName(res.data.data.lastName);
      setRole(res.data.data.role);
      setTrialExpires(new Date(res.data.data.trialExpires));
      console.log('data', firstName);
    }
    getUserDetails();
  }, [])




  useEffect(() => {
    const updateRemainingTime = () => {
      const now = new Date();
      const timeDiff = trialExpires.getTime() - now.getTime();
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setRemainingTime(`${days} Days`);
      } else if (hours > 0) {
        setRemainingTime(`${hours} Hours`);
      } else {
        setRemainingTime('Less than an hour');
      }
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [trialExpires]);

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
      <div className="flex flex-row justify-between    gap-6 items-center px-4 py-4 w-full dark:bg-[#05071E] ">
        <div className='flex  ml-4'>
          {/* <img src='/zapllo.png' className='w-full h-10 mt-2' /> */}
          <h1 className='text-xl font-bold mt-1'>Hello, {firstName} 👋 </h1>
        </div>
        <span className="flex items-center gap-2 font-bold">
          {/* <p className="text-sm font-light text-gray-300">Credits</p>
        {tier == 'Unlimited' ? (
          <span>Unlimited</span>
        ) : (
          <span>
            {credits}/{tier == 'Free' ? '10' : tier == 'Pro' && '100'}
          </span>
        )} */}
        </span>
        <div className='flex gap-4 '>
          {/* <span className="flex items-center rounded-full bg-muted px-4">
            <Search />
            <Input
              placeholder="Quick Search"
              className="border-none bg-transparent"
            />

          </span> */}
          <h1 className='text-sm mt-2'>Access Expires in <span className='text-red-500 font-bold'>{remainingTime}</span></h1>
          <Button className='h-7 bg-white text-black  hover:text-white mt-1'>👑 Upgrade to Pro</Button>
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
          {/* <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Book />
              </TooltipTrigger>
              <TooltipContent>
                <p>Guide</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
          {/* <TooltipProvider >
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <LogOutIcon className='hover:text-red-500' onClick={logout} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
          <DropdownMenu  >
            <DropdownMenuTrigger asChild>
              <div className='h-8 items-center cursor-pointer flex justify-center w-8 border bg-purple-500 rounded-full mt-1'>
                <User className='h-5  w-5 ' />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 ">
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
                <DropdownMenuItem>
                  Settings
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {/* <DropdownMenuSeparator /> */}
              {/* <DropdownMenuGroup>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>Email</DropdownMenuItem>
                      <DropdownMenuItem>Message</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>More...</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem>
                  New Team
                  <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup> */}
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem>GitHub</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem disabled>API</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                Log out
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


        {/* <UserButton /> */}
      </div>
    </>
  )
}

export default InfoBar
