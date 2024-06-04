import React from 'react';

export default function Arrow() {
    return (
        <div className=" w-screen bg-[#0A0D28]">

            <div className='relative  mx-'>
                <img src='/arrow.png' className='lg:absolute 2xl:hidden hidden lg:block top-[-2%]  transform -translate-x- w-[92%] z-10' />
                {/* First div placement */}
                <div className='hidden   md:grid grid-cols-5'>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div className=' z-20'>
                        <div className='p-10 w-fit rounded-full w- bg-[#141841]'>
                            Hi 1
                        </div>
                        <h1 className='mt-12 font-bold text-white'>Expert Oversight</h1>
                        <p className='text-[#676B93] mt-4 max-w-[200px] text-xs w-full'>We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience</p>
                    </div>
                </div>
                {/* Second div placement */}
                <div className='hidden md:grid grid-cols-5 gap-12'>
                    <div></div>
                    <div></div>
                    <div className='-ml-24 -mt-12 z-20'>
                        <div className='p-10 w-fit rounded-full w- bg-[#141841]'>
                            Hi 3
                        </div>
                        <h1 className='mt-12 font-bold text-white'>Expert Oversight</h1>
                        <p className='text-[#676B93] mt-4 max-w-[200px] text-xs w-full'>We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience</p>
                    </div>
                    <div className='-mt-44 absolute ml-[60%] z-20'>
                        <div className='p-10  w-fit rounded-full w- bg-[#141841]'>
                            Hi 2
                        </div>
                        <h1 className='mt-12 font-bold text-white'>Expert Oversight</h1>
                        <p className='text-[#676B93] mt-4 max-w-[200px] text-xs w-full'>We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience</p>
                    </div>
                    <div></div>

                </div>

                {/* Third div placement */}
                <div className='hidden md:grid  grid-cols-5 gap-12'>
                    <div></div>
                    <div className='-ml-36 -mt-[165px] z-20'>
                        <div className='p-10 w-fit rounded-full w- bg-[#141841]'>
                            Hi 4
                        </div>
                        <h1 className='mt-12 font-bold text-white'>Expert Oversight</h1>
                        <p className='text-[#676B93] mt-4 max-w-[200px] text-xs w-full'>We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience</p>
                    </div>
                    <div></div>

                </div>

                {/* Arrow image */}
                {/* <img src='/arrow.png' className='lg:absolute  -top-3 left- transform -translate-x- w-[90%] z-10' /> */}


                <div className='flex md:hidden justify-start p-4'>
                    <div className='grid grid-cols-1 '>
                        <div className=' z-20'>
                            <div className='p-6 w-fit rounded-full w- bg-[#141841]'>
                                Hi
                            </div>
                            <h1 className='mt-4 font-bold text-white'>Expert Oversight</h1>
                            <p className='text-[#676B93] mt-4 md:max-w-[200px] text-sm w-full'>We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience</p>
                        </div>

                        <div className='mt-8'>
                            <div className=' z-20'>
                                <div className='p-6 w-fit rounded-full w- bg-[#141841]'>
                                    Hi
                                </div>
                                <h1 className='mt-4 font-bold text-white'>Expert Oversight</h1>
                                <p className='text-[#676B93] mt-4 md:max-w-[200px] text-sm w-full'>We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience</p>
                            </div>
                        </div>
                        <div className='mt-8'>
                            <div className=' z-20'>
                                <div className='p-6 w-fit rounded-full w- bg-[#141841]'>
                                    Hi
                                </div>
                                <h1 className='mt-4 font-bold text-white'>Expert Oversight</h1>
                                <p className='text-[#676B93] mt-4 md:max-w-[200px] text-sm w-full'>We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience</p>
                            </div>
                        </div>
                        <div className='mt-8 '>
                            <div className=' z-20'>
                                <div className='p-6 w-fit rounded-xl w- bg-[#141841]'>
                                    Hi
                                </div>
                                <h1 className='mt-4 font-bold text-white'>Expert Oversight</h1>
                                <p className='text-[#676B93] mt-4 md:max-w-[200px] text-sm w-full'>We use good old fashioned human oversight to ensure your newsletters are world-class. Your content always maintains a human touch to ensure a personal connection with your audience</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
