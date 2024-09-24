import Link from 'next/link'
import React from 'react'

type Props = {}

export default function Settings({ }: Props) {
    return (
        <div className='pt-4'>
            <div className=' bg-[#380E3D] mt-4  my-4 mx-2 p-2 border rounded '>
                <h1 className='text-sm'>Leave Types</h1>
            </div>
            <Link href='/attendance/settings/leave-types'>
                <div className='mb-2 cursor-pointer hover:bg-[#75517B]  my-4 mx-2 p-2 w-full m border rounded py-2'>
                    <h1 className=' text-xs '>Leave Types</h1>
                </div>
            </Link>
            <div className=' mt-4 bg-[#380E3D]  my-4 mx-2 p-2 border rounded '>
                <h1 className='text-sm'>Attendance Settings</h1>
            </div>
            <Link href='/attendance/settings/register-faces'>
                <div className='mb-2 cursor-pointer hover:bg-[#75517B]  my-4 mx-2 p-2 w-full m border rounded py-2'>
                    <h1 className=' text-xs '>Register Faces</h1>
                </div>
            </Link>
        </div>
    )
}