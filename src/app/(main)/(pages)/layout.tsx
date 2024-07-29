import React from 'react'

type Props = { children: React.ReactNode }

const Layout = ({ children }: Props) => {
    return (
        <div className=' bg-[#0A0D28]  scrollbar-hide h-full w-full  border-muted-foreground/20 overflow overflow-x-hidden'>
            <div className='w-full h-full overflow-x-hidden'>
                {children}
            </div>
        </div>
    )
}

export default Layout







