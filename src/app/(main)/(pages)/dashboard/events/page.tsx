'use client'

import ChecklistSidebar from '@/components/sidebar/checklistSidebar'
import React from 'react'

export default function Events() {
    return (
        <div className="flex mt-24">
            <ChecklistSidebar />
            <div className="flex-1 border-l p-4 ml-12 h-screen">
                <div className="w-full -ml-2  mx-auto">
                    <div className="gap-2 flex mb-6 w-full">
                        <div className="-mt-2 w-full">
                            <div className='p-10 border-l flex justify-center -mt-16 l w-full max-w-8xl  ml-48'>
                                Events
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
