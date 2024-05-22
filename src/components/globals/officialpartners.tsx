import React from 'react'
import NumberTicker from '../magicui/number-ticker'

export default function OfficialPartners() {
    return (
        <div className=''>
            <div className='bg-gradient-to-r from-[#815BF5] px-12 py-6 rounded-2xl  to-[#FC8929] grid lg:grid-cols-2 grid-cols-1 max-w-[1200px] gap-4  '>
                <h1 className='text-4xl font-semibold mt-4'>Official Business Partners</h1>
                <img src='partners.png' className='h-20 ml-auto' />
            </div>
            <div className='text-6xl max-w-[1100px] mt-16 grid grid-cols-3'>
                <div className=''>
                    <NumberTicker value={50} />
                    <h1 className='text-2xl font-semibold '>Industries</h1>
                    <p className='text-[#676B93] mt-4 font-normal text-sm'>We use good old fashioned human <br />oversight to ensure your newsletters are<br/> world-class.</p>
                </div>
                <div>
                    <NumberTicker value={150} />
                    <h1 className='text-2xl font-semibold '>Countries</h1>
                    <p className='text-[#676B93] mt-4 font-normal text-sm'>We use good old fashioned human <br />oversight to ensure your newsletters are<br/> world-class.</p>
                </div>  <div>
                    {/* <NumberTicker value={1500000} /> */}
                    <h1 className='inline-block tabular-nums text-transparent bg-gradient-to-r font-bold from-[#815BF5]  py-6 rounded-2xl  to-[#FC8929] bg-clip-text '>1.5M+</h1>
                    <h1 className='text-2xl font-semibold '>Operations Monthly</h1>
                    <p className='text-[#676B93] mt-4 font-normal text-sm'>We use good old fashioned human <br />oversight to ensure your newsletters are<br/> world-class.</p>
                </div>


            </div>
        </div>
    )
}
