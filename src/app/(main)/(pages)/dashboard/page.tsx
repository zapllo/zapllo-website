import { ShiningButton } from '@/components/globals/shiningbutton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const DashboardPage = () => {
  return (
    <div className=' dark:bg-[#0A0D28] mt-4 gap-4 relative overflow-x-hidden'>
      {/* <h1 className='text-xl gap-2 sticky top-0 z-[10] -mt-12   dark:bg-[#04071F] backdrop-blur-lg flex items-center border-b'>   <Home className='h-5' />  Dashboard
      </h1> */}
      <div className='flex  w-[100%] '>
        <div className='w-full'>
          <Card className='p-8 ml-8 h-56 w-[110%] flex  justify-between  border border-[#616072] '>
            <div className='w-full'>
              <img src='/icons/ellipse.png' className='absolute h-[60%] w-[70%] z-[100]  -ml-96 opacity-60 -mt-[15%] ' />
              <h1 className='text-2xl'>Tutorials</h1>
              <p className='mt-4 text-lg'>Learn how to to get best out of business workspace</p>
              <Button className='bg-[#F7EEF2] mt-6 '>
                <h1 className='bg-gradient-to-r font-bold  from-[#815BF5] via-[#FC8929] to-[#FC8929] text-transparent bg-clip-text'>
                  Go To Tutorials
                </h1>
              </Button>
            </div>
            <img src='/icons/tutorial.png' className='h-56  ml-auto -mt-6 ' />
          </Card>
          <div className='flex w-[120%]  gap-4 p-6'>
            <div className='p-4 border border-[#616072] bg-[#0A0D28] w-[100%]  m-4  text-white items-center flex justify-start rounded-2xl '>
              <div className=' font-bold text-xl space-y-2'>
                <div className='rounded-full h-12 border-white border w-12'>
                  <img src='/icons/atask.png' className=' ml-3 mt-3 h-6     object-cover' />
                </div>
                <h1>Automate Tasks</h1>
                <p className='text-xs'>Delegate one time and recurring task to your team</p>
                <div className='pt-2'>
                  <Link href='/dashboard/tasks'>
                    <Button className='bg-[#8747E9] ' >Go To Task Management</Button>
                  </Link>

                </div>
              </div>
            </div>
            <div className='p-4 border border-[#616072] bg-[#0A0D28] w-[100%]  m-4  text-white items-center flex justify-start rounded-2xl '>
              <div className=' font-bold text-xl space-y-2'>
                <div className='rounded-full h-12 border-white border w-12'>
                  <img src='/icons/intranet.png' className=' ml-3 mt-3 h-6     object-cover' />
                </div>
                <h1>Automate Intranet</h1>
                <p className='text-xs '>Manage all your important company links</p>
                <div className='pt-2'>
                  <Button className='bg-[#8647EB]' >Go To Intranet</Button>
                </div>
              </div>
            </div>
          </div>
          <div className='flex w-[120%] -mt-12  gap-4 p-6'>
            <div className='p-4 border max-h-96 h-full border-[#616072] bg-[#0A0D28] w-[100%]  m-4  text-white items-center flex justify-start rounded-2xl '>
              <div className=' font-bold text-xl space-y-4'>
                <div className='rounded-full h-12 border-white border w-12'>
                  <img src='/icons/attendance.png' className=' ml-3 mt-3 h-6     object-cover' />
                </div>
                <h1>Automate Attendance</h1>
                <p className='text-xs'>Track your team attendance and breaks.</p>
                <div className=''>
                  <Button className='bg-[#8647EB]' >Start Trial</Button>
                </div>
              </div>
            </div>
            <div className='p-4 border border-[#616072] bg-[#0A0D28] w-[100%]  m-4  text-white items-center flex justify-start rounded-2xl '>
              <div className=' font-bold text-xl space-y-4'>
                <div className='rounded-full h-12 border-white border w-12'>
                  <img src='/icons/whatsapp.png' className=' ml-2 mt-2 h-7     object-cover' />
                </div>
                <h1>Automate WA</h1>
                <p className='text-xs'>Official Whatsapp API for all business communication</p>
                <div className=''>
                  <Button className='bg-[#8647EB]' >Go To WhatsApp API</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='w-3/4 -mt-4'>
          <div className='grid grid-cols-1'>
            <div className='p-4 border border-[#616072] bg-[#0A0D28] w-[70%] ml-auto m-4  text-white items-center flex justify-start rounded-2xl '>
              <div className=' font-bold text-xl space-y-2'>
                <div className='rounded-full h-12 border-white border w-12'>
                  <img src='/icons/progress.png' className=' ml-3 mt-3 h-6     object-cover' />

                </div>
                <h1 className='text-gray-400  text-xs'>Your Progress</h1>
                <h1>App Usage Progress</h1>
                <Progress value={100} className='w-[170%]' />
                <div className=''>
                  <Button className='bg-[#8647EB]' >Checklist</Button>
                </div>
              </div>
            </div>
            <div className='p-4 border border-[#616072] bg-[#0A0D28] w-[70%] ml-auto m-4 mt-5  text-white items-center flex justify-start rounded-2xl '>
              <div className=' font-bold text-xl space-y-2'>
                <div className='rounded-full h-12 border-white border w-12'>
                  <img src='/icons/calendar.png' className=' ml-3 mt-3 h-6     object-cover' />
                </div>
                <h1>Automate Leaves</h1>
                <p className='text-xs'>Manage your Employee Leaves and Holidays.</p>
                <div className='pt-2'>
                  <Button className='bg-[#8647EB]' >Start Trial</Button>
                </div>
              </div>
            </div>
            <div className='p-4 border border-[#616072] bg-[#0A0D28] w-[70%] ml-auto m-4  text-white items-center flex justify-start rounded-2xl '>
              <div className=' font-bold text-xl space-y-4'>
                <div className='rounded-full h-12 border-white border w-12'>
                  <img src='/icons/crm.png' className='invert-[100] ml-2 mt-3 h-7     object-cover' />
                </div>
                <h1>Automate CRM</h1>
                <p className='text-xs'>Track and convert and assign leads to your sales team</p>
                <div className=''>
                  <Button className='bg-[#8647EB]' >Start Trial</Button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default DashboardPage