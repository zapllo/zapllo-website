import React from 'react'

type Props = { children: React.ReactNode }

const Layout = ({ children }: Props) => {
    return (
        <div className='border-l-[1px] border-t-[1px] pb-20 scrollbar-hide h-full w-full overflow-hidden rounded-l-3xl border-muted-foreground/20 overflow-y-scroll'>
            <div className='w-full'>
                {children}
            </div>
        </div>
    )
}

export default Layout







