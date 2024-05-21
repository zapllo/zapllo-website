import React from 'react'
import SkewedInfiniteScroll from '../ui/skewed-infinite-scroll'
import { BookCall } from '../ui/bookcall'
import { Golos_Text } from 'next/font/google'

const golos = Golos_Text({ subsets: ["latin"] });


export default function Tools() {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 max-w-[1100px]   mt-24  '>
            <div className=''>
                <p className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent  font-bold mt-12  text-2xl'> Our Top Picks
                </p>
                <h1 className='text-4xl font-bold mt-2'>Automation Made Simple at <span className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent mt-2  font-bold'>zapllo.com </span> </h1>
                <p className={`mt-4 ${golos.className}`}>🔓 Unlock your business potential with our expert team of engineers guiding you to the perfect tech tools tailored just for you.</p>
                <div className='flex justify-start mt-8'>
                <BookCall />

                </div>
            </div>
            <div>
                <SkewedInfiniteScroll />
            </div>
        </div>
    )
}
