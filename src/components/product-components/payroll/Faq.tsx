import React from 'react'
import { Accordion2, AccordionContent2, AccordionItem2, AccordionTrigger2 } from '@/components/ui/accordion2'

export default function PayrollFaq() {
    return (
        <div>
            <div className='mt-4 space-y-4'>
                <Accordion2 type="single" collapsible className=' '>
                    <AccordionItem2 value="item-1">
                        <AccordionTrigger2>Facial Recognition</AccordionTrigger2>
                        <AccordionContent2>
                            Employees can effortlessly punch in and out through their mobile
                            phones, enhancing security and efficiency. With real-time face
                            detection, offsite employees can easily manage attendance.
                        </AccordionContent2>
                    </AccordionItem2>
                </Accordion2>
            </div>
        </div>
    )
}
