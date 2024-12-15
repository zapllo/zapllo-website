import { InfiniteMoving2 } from '@/components/globals/infinite-moving2';
import React from 'react'

type Props = {
    product: string;
}

export default function Business({ product }: Props) {
    return (
        <div className='w-full flex justify-center'>
            <div className='mb-16 mt-20 '>
                <div className='flex justify-center'>
                    <h1 className='text-center  text-3xl font-bold md:max-w-xl'>Smart Business Owners using <span className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent '>
                        {product}
                    </span> </h1>
                </div>
                <div className='w-screen text-center  justify-center mt-8 flex gap-2  bg-black  -400'>
                    <InfiniteMoving2 />
                </div>
            </div>
        </div>
    )
}