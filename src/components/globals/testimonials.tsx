import React from 'react'
import { LetsTalk } from '../ui/letstalk'

export default function Testimonials() {
    return (
        <>
            <div className="radial-gradient md:flex gap-4 max-w-[1300px]">
                <div className='p-4 max-w-[400px] w-full'>
                    <img src='bald.png' className='' />

                </div>
                <div className='p-4 max-w-[650px] w-full'>
                    <div className='flex justify-center md:block'>
                        <img src='star.png' className='' />

                    </div>
                    <h1 className='mt-4 md:text-3xl  text-3xl mx-4 md:mx-0 font-semibold md:font-bold'>65% of our clients have triple their profits in the first 6 months.</h1>
                    <p className='text-sm mt-4 max-w-[300px] mx-4 md:mx-0 md:max-w-[700px]  w-full'>Automate and Upgrade your Workflow encapsulates the idea of enhancing efficiency by implementing automated processes while simultaneously improving the quality or effectiveness of your workflow. It emphasizes utilizing technology to streamline tasks and optimize productivity.</p>
                    <div className='mt-8 md:justify-start  md:absolute md:flex'>
                        <LetsTalk />

                    </div>

                </div>

            </div>

        </>

    )
}
