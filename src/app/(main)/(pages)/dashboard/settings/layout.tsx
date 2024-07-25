
import InfoBar from '@/components/infobar'
import SettingsOptions from '@/components/sidebar/settingsSidebar'
import React from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {
    return (
        <div className='flex overflow-hidden scrollbar-hide h-full '>
            <SettingsOptions />
            <div className='w-full'>
                {/* <InfoBar /> */}
                {props.children}
            </div>
        </div>
    )
}

export default Layout