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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className='flex overflow-hidden scrollbar-hide  h-full '>
            {/* <MenuOptions /> */}
            <TaskOptions />
            <div className='w-full'>
                {/* <InfoBar /> */}
                {props.children}
            </div>
            <div className="fixed bottom-8 right-8 z-50">
                <button className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={openModal}>
                    <PlusCircleIcon size={24} />
                </button>
            </div>
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <TaskModal closeModal={closeModal} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Layout