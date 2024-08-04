import { ShiningButton } from '@/components/globals/shiningbutton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const DashboardPage = () => {
  return (
    <div className=' dark:bg-[#211025] pt-4 gap-4 relative overflow-x-hidden scrollbar-hide'>
      {/* <h1 className='text-xl gap-2 sticky top-0 z-[10] -mt-12   dark:bg-[#04071F] backdrop-blur-lg flex items-center border-b'>   <Home className='h-5' />  Dashboard
      </h1> */}


      <div className='grid grid-cols-3'>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#616072] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-2'>
              <div className='rounded-full h-12 border-white border w-12'>
                <img src='/icons/atask.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1>Automate Tasks</h1>
              <p className='text-xs'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] hover:bg-[#7C3886]' >Go To Task Management</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#616072] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-2'>
              <div className='rounded-full h-12 border-white border w-12'>
                <img src='/icons/atask.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1>Automate Tasks</h1>
              <p className='text-xs'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] hover:bg-[#7C3886]' >Go To Task Management</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#616072] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-2'>
              <div className='rounded-full h-12 border-white border w-12'>
                <img src='/icons/atask.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1>Automate Tasks</h1>
              <p className='text-xs font-thin'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] hover:bg-[#7C3886]' >Go To Task Management</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
      </div>

      <div className='grid grid-cols-3'>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#616072] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-2'>
              <div className='rounded-full h-12 border-white border w-12'>
                <img src='/icons/atask.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1>Automate Tasks</h1>
              <p className='text-xs'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] hover:bg-[#7C3886]' >Go To Task Management</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#616072] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-2'>
              <div className='rounded-full h-12 border-white border w-12'>
                <img src='/icons/atask.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1>Automate Tasks</h1>
              <p className='text-xs'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] hover:bg-[#7C3886]' >Go To Task Management</Button>
                </Link>

              </div>
            </div>
          </div>

        </div>
        <div className='flex  gap-4 ml-6'>
          <div className='p-4 border border-[#616072] bg-[#221126]  m-4  text-white items-center flex justify-start rounded-2xl '>
            <div className=' font-bold text-xl space-y-2'>
              <div className='rounded-full h-12 border-white border w-12'>
                <img src='/icons/atask.png' className=' ml-3 mt-3 h-6     object-cover' />
              </div>
              <h1>Automate Tasks</h1>
              <p className='text-xs'>Delegate one time and recurring task to your team</p>
              <div className='pt-2'>
                <Link href='/dashboard/tasks'>
                  <Button className='bg-[#7C3886] hover:bg-[#7C3886]' >Go To Task Management</Button>
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