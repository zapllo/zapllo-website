import React from 'react'
import { ServicesScroll } from './services'

export default function Service() {
    return (
        <div className='text-center justify-center'>
            <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold text-3xl'>Services</h1>
            <h1 className='text-4xl mt-2 font-bold'>Services we Provide</h1>
            <div className='flex justify-center'>

                <ServicesScroll />
            </div>
        </div>
    )
}
