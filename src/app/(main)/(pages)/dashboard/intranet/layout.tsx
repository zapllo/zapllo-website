'use client'

import React, { useState } from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {

    return (
        <div className='w-full overflow-hidden  bg-  h-screen '>
            {/* <InfoBar /> */}
            {props.children}
        </div>

    )
}

export default Layout