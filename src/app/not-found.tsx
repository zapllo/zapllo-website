import { FloatingNavbar } from '@/components/globals/navbar'
import { FloatingNav } from '@/components/ui/floating-navbar'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className=' bg-[#05071E]'>
            <FloatingNavbar />

            <div className='text-center mt-32 p-10 flex justify-center'>
                <h2 className='font-bold'>Oops! Not Found</h2>
            </div>
            <p className='text-center p-10'>Could not find requested resource,<br /> We're working our best to keep your experience seamless</p>
            <Link href="/" className='flex justify-center'>
                <img src='/logo.png' className='h-12' />
            </Link>
        </div>
    )
}