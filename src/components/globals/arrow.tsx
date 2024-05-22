import React from 'react';

export default function Arrow() {
    return (
        <div className=" w-screen bg-[#0A0D28]">
            <div className='relative  mx-'>
                {/* First div placement */}
                <div className='grid grid-cols-7 gap-2 mb-24'>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div className='z-20'>
                        <div className='py-6 px-8 rounded-xl w-fit bg-[#141841]'>
                            Hi
                        </div>
                        <h1 className='mt-12 text-white'>Expert Oversight</h1>
                    </div>
                </div>
                {/* Second div placement */}
                <div className='grid grid-cols-6 gap-2 mb-24'>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div className='z-20'>
                        <div className='py-6 px-8 rounded-xl w-fit bg-[#141841]'>
                            Hi
                        </div>
                        <h1 className='mt-12 text-white'>Growth Strategies</h1>
                    </div>
                </div>
                {/* Third div placement */}
                <div className='grid grid-cols-5 gap-2 mb-24'>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div className='z-20'>
                        <div className='py-6 px-8 rounded-xl w-fit bg-[#141841]'>
                            Hi
                        </div>
                        <h1 className='mt-12 text-white'>Implementation</h1>
                    </div>
                </div>
                {/* Fourth div placement */}
                <div className='grid grid-cols-4 gap-2'>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div className='z-20'>
                        <div className='py-6 px-8 rounded-xl w-fit bg-[#141841]'>
                            Hi
                        </div>
                        <h1 className='mt-12 text-white'>Final Review</h1>
                    </div>
                </div>
                {/* Arrow image */}
                <img src='/arrow.png' className='absolute top-0 left-1/2 transform -translate-x-1/2 w-[90%] z-10' />
            </div>
        </div>
    );
}
