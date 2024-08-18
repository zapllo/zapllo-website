'use client'

import { ShiningButton } from '@/components/globals/shiningbutton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Home } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation'

const DashboardPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already logged in
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className=' dark:bg-[#211025] pt-4 gap-4 relative overflow-x-hidden scrollbar-hide'>
      {/* <h1 className='text-xl gap-2 sticky top-0 z-[10] -mt-12   dark:bg-[#04071F] backdrop-blur-lg flex items-center border-b'>   <Home className='h-5' />  Dashboard
      </h1> */}


      <div className='grid grid-cols-3'>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#E0E0E066] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/atask.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate Tasks</h1>
              <p className='text-xs font-medium'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] py-1 hover:bg-[#7C3886] text-xs' >Go To Task Management</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#E0E0E066] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/intranet.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate Intranet</h1>
              <p className='text-xs font-medium'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] py-1 hover:bg-[#7C3886] opacity-50 text-xs' >Go To Intranet</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#E0E0E066] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/attendance.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate Leaves</h1>
              <p className='text-xs font-medium'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] py-1 hover:bg-[#7C3886] opacity-50 text-xs' >Go To Leaves</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
      </div>

      <div className='grid grid-cols-3'>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#E0E0E066] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/attendance.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate Attendance</h1>
              <p className='text-xs font-medium'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] py-1 hover:bg-[#7C3886] opacity-50 text-xs' >Go To Attendance</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#E0E0E066] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/whatsapp.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate WA</h1>
              <p className='text-xs font-medium'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] py-1 hover:bg-[#7C3886] opacity-50 text-xs' >Go To WhatsApp API</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#E0E0E066] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-1'>
              <div className='rounded-full h-12 border-[#E0E0E066] border w-12'>
                <img src='/icons/crm.png' className=' ml-3 mt-3 h-6  invert-[100]    object-cover' />
              </div>
              <h1 className='text-lg font-medium'>Automate CRM</h1>
              <p className='text-xs font-medium'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] py-1 hover:bg-[#7C3886] opacity-50 text-xs' >Coming Soon</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DashboardPage