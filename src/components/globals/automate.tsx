import { Golos_Text } from 'next/font/google';
import React from 'react'
import { DockDemo } from './dock';
import { BookCall } from '../ui/bookcall';
import { BookCall2 } from '../ui/bookdemo';

const golos = Golos_Text({ subsets: ["latin"] });

export default function Automate() {
    return (
        <div className="bg-gradient-to-r from-[#815BF5] px-8 py-6 md:rounded-2xl  to-[#FC8929] grid lg:grid-cols-2 grid-cols-1   md:max-w-[1100px] mx-4  gap-2">
            <div className='w-full'>
                <h1 className='text-2xl font-bold'>Automate and Upgrade your Workflow</h1>
                <p className={`${golos.className} text-sm mt-4 w-full text-gray-200`}>Automate and Upgrade your Workflow encapsulates the idea of enhancing efficiency by implementing automated processes while simultaneously improving the quality or effectiveness of your workflow. </p>
                <div className='flex  mt-6 justify-start'>
                    <BookCall2 />
                </div>
            </div>
            <div>
                <DockDemo />
            </div>
        </div>
    )
}
