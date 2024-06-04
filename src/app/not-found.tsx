import { FloatingNavbar } from '@/components/globals/navbar'
import { FloatingNav } from '@/components/ui/floating-navbar'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className=' bg-[#05071E]'>
            <FloatingNavbar />


            <div className='max-w-8xl mt-24 flex justify-center'>
                <img src='404.png' className='h-96 w-auto' />
            </div>
            <div className='text-center  p-10 flex justify-center'>
                <h2 className='font-bold'>Oops! Not Found</h2>
            </div>
            <p className='text-center p-4'>Could not find requested resource,<br /> We are working our best to keep your experience seamless</p>
          
        </div>
    )
}