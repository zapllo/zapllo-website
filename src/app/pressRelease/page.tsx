import Footer from '@/components/globals/Footer'
import { FloatingNavbar } from '@/components/globals/navbar'
import React from 'react'

type Props = {}

export default function PressRelease({ }: Props) {
    return (
        <>
            <div className='flex justify-center overflow-hidden bg-[#05071E]  w-full h-full'>
                <main className="bg-[#05071E] max-w-6xl   h-full z-10 overflow-hidden">
                    <FloatingNavbar />

                    <h1 className='text-center font-bold mt-32 text-4xl mb-96'>Press Release</h1>
                </main>

            </div>
            <div className='pt-12 bg-[#05071E] '>
                <Footer />
            </div>
        </>
    )
}