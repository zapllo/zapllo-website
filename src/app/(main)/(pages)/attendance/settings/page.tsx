import { StopwatchIcon } from '@radix-ui/react-icons'
import { Calendar, CameraIcon, Clock } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {}

export default function Settings({ }: Props) {
    return (
        <div className='pt-4 w-full max-w-screen '>
            <div className=' bg-[#380E3D]  mt-4 mx-2  my-4  p-2 border rounded '>

                <h1 className='text-sm'>Leave Types</h1>
            </div>
            <Link href='/attendance/settings/leave-types'>
                <div className='mb-2 cursor-pointer flex gap-1 hover:bg-[#75517B]  my-4 mx-2 p-2 w-   m border rounded py-2'>
                    <Calendar className='h-4' />
                    <h1 className=' text-xs mt-[1px] '>Add your Leave Types</h1>
                </div>
            </Link>
            <div className=' mt-4 bg-[#380E3D]  my-4 mx-2 p-2 border rounded '>
                <h1 className='text-sm'>Attendance Settings</h1>
            </div>
            <Link href='/attendance/settings/register-faces'>
                <div className='mb-2 flex gap-1 cursor-pointer hover:bg-[#75517B]  my-4 mx-2 p-2 w- m border rounded py-2'>
                    <CameraIcon className='h-4' />
                    <h1 className=' text-xs '>
                        Setup Face Registration</h1>
                </div>
            </Link>
            <div className='mb-2 flex gap-1 cursor-pointer hover:bg-[#75517B]  my-4 mx-2 p-2 w- m border rounded py-2'>
                <StopwatchIcon className='h-4 ml-1' />
                <h1 className=' text-xs '>Setup Reminders</h1>
            </div>
        </div>
    )
}