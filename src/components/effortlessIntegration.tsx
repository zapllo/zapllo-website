import React from 'react'

type Props = {}

export default function Effortless({ }: Props) {
    return (
        <div className='mb-16 mt-20 '>
            <h1 className='text-center text-white text-2xl font-bold md:text-5xl'>Effortlessly automate all your favorite apps</h1>
            <div className='    ml-24 mt-20'>
                <div className='grid grid-cols-5 gap-x- gap-10'>
                    <img src='brands/highlevel.png' className='h-12' />
                    <img src='brands/hubspot.png' className='h-12 ml-5' />
                    <img src='brands/salesforce.png' className='h-16 ml-10' />
                    <img src='brands/mailchimp.jpg' className='h-16  rounded-full' />
                    <img src='brands/keap.png' className=' h-16 -full -ml-10' />


                </div>

                <div className='grid grid-cols-4 ml-28 mt-12 gap-y-8  '>
                    <img src='brands/shopify.webp' className=' h-16 -full' />
                    <img src='brands/zoom.png' className='h-16  -full' />
                    <img src='brands/gmail.webp' className=' h-12 -full' />
                    <img src='brands/jira.png' className=' h-12 -full' />



                </div>
                <div className='grid grid-cols-4 gap-y-8 ml-64 mt-12'>
                    <img src='/whatsapp.png' className=' h-16 -full' />
                    <img src='brands/openai.png' className='invert-[100] h-16 -full' />
                    <img src='brands/stripe.png' className=' h-16 -full' />
                </div>
            </div>
        </div>
    )
}