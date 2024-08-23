'use client'

import TaskModal from '@/components/globals/taskModal'
import { motion, AnimatePresence } from 'framer-motion';
import InfoBar from '@/components/infobar'
// import MenuOptions from '@/components/sidebar'
import TaskOptions from '@/components/taskbar'
import { PlusCircle, PlusCircleIcon } from 'lucide-react'
import React, { useState } from 'react'

type Props = { children: React.ReactNode }

const Layout = (props: Props) => {

    return (
        <div className='w-full overflow-hidden okay bg-  h-screen '>
            {/* <InfoBar /> */}
            {props.children}
        </div>

    )
}

export default Layout