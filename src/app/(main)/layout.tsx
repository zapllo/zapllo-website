import InfoBar from '@/components/infobar'
import MenuOptions from '@/components/sidebar'
import React from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {
    return (
        <div className='flex overflow-hidden dark:bg-[#0A0D28] scrollbar-hide h-full '>
            <MenuOptions />
            <div className='w-full overflow-x-hidden '>
                <InfoBar />
                {props.children}
            </div>
        </div>
    )
}

export default Layout