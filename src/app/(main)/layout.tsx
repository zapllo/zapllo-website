import InfoBar from '@/components/infobar'
import MenuOptions from '@/components/sidebar'
import React from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {
    return (
        <div className='flex overflow-hidden   dark:bg-[#201124] scrollbar-hide h-full w-full '>
            <MenuOptions />
            <div className='w-full overflow-hidden please h-screen '>
                <InfoBar />
                <div className='mt-[69px] '>
                {props.children}

                </div>
            
            </div>
        </div>
    )
}

export default Layout