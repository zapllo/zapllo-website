'use client'
import React, { useEffect } from 'react'
// import { ModeToggle } from '../global/mode-toggle'
import { Book, Headphones, Search } from 'lucide-react'
import Templates from '../icons/cloud_download'
import { Input } from '@/components/ui/input'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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

  return (
    <>
      <div className="flex flex-row justify-between gap-6 items-center px-4 py-4 w-full dark:bg-[#05071E] ">
        <div className='flex justify-center'>
          <img src='/Zapllo.png' className='w-full h-10 mt-2' />
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
        <div className='flex gap-2'>
          <span className="flex items-center rounded-full bg-muted px-4">
            <Search />
            <Input
              placeholder="Quick Search"
              className="border-none bg-transparent"
            />

          </span>
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
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Book />
              </TooltipTrigger>
              <TooltipContent>
                <p>Guide</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>


        {/* <UserButton /> */}
      </div>
    </>
  )
}

export default InfoBar
