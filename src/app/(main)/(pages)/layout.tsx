import React from 'react'

type Props = { children: React.ReactNode }

const Layout = ({ children }: Props) => {
    return (
        <div className=' bg-[#201124]  scrollbar-hide h-screen w-full  border-muted-foreground/20  overflow-hidden '>
            <div className='w-full h-screen overflow-hidden'>
                {children}
            </div>
        </div>
    )
}

export default Layout







