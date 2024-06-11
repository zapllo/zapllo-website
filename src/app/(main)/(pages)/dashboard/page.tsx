import { ShiningButton } from '@/components/globals/shiningbutton'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const DashboardPage = () => {
  return (
    <div className='flex flex-col dark:bg-[#04071F] gap-4 relative'>
      <h1 className='text-xl gap-2 sticky top-0 z-[10] p-6 dark:bg-[#04071F] backdrop-blur-lg flex items-center border-b'>   <Home className='h-5' />  Dashboard
      </h1>
      <div className='grid grid-cols-4 gap-4 p-6'>
        <div className='p-4 dark:bg-[#121741] bg-[#EEE0FF] dark:text-white text-[#51247e]  items-center flex justify-center rounded-md '>
          <div className='text-center font-bold text-xl space-y-4'>
            <h1>Tasks</h1>
            <Link href='/dashboard/tasks'>
              <Button className='hover:bg-[#BD8AFF] mt-2'>Go to Task Management</Button>
            </Link>
          </div>
        </div>
        <div className='p-4 dark:bg-[#121741] bg-black text-white items-center flex justify-center rounded-md '>
          <div className='text-center font-bold text-xl space-y-4'>
            <h1>Intranet</h1>
            <div className='opacity-50'>
              <ShiningButton text='Coming Soon' />
            </div>
          </div>
        </div>
        <div className='p-4 dark:bg-[#121741] bg-black text-white items-center flex justify-center rounded-md '>
          <div className='text-center font-bold text-xl space-y-4'>
            <h1>Leaves</h1>
            <div className='opacity-50'>
              <ShiningButton text='Coming Soon' />
            </div>
          </div>
        </div>
        <div className='p-4 bg-black text-white dark:bg-[#121741] items-center flex justify-center rounded-md '>
          <div className='text-center font-bold text-xl space-y-4'>
            <h1>Attendance</h1>
            <div className='opacity-50'>
              <ShiningButton text='Coming Soon' />
            </div>
          </div>
        </div>
        <div className='p-4 bg-black text-white dark:bg-[#121741] items-center flex justify-center rounded-md '>
          <div className='text-center font-bold text-xl space-y-4'>
            <h1>Expenses</h1>
            <div className='opacity-50'>
              <ShiningButton text='Coming Soon' />
            </div>
          </div>
        </div>
        <div className='p-4 bg-black text-white dark:bg-[#121741] items-center flex justify-center rounded-md '>
          <div className='text-center font-bold text-xl space-y-4'>
            <h1>CRM</h1>
            <div className='opacity-50'>
              <ShiningButton text='Coming Soon' />
            </div>
          </div>
        </div>
        <div className='p-4 bg-black text-white dark:bg-[#121741] items-center flex justify-center rounded-md '>
          <div className='text-center font-bold text-xl space-y-4'>
            <h1>Whatsapp API</h1>
            <div className='opacity-50'>
              <ShiningButton text='Coming Soon' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage