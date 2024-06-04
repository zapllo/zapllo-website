import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import GradientText from '../magicui/gradient'

export default function Faq() {
    return (
        <div>
            <GradientText>
                <h1 className='bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent text-center font-bold text-3xl'>FAQ</h1>
            </GradientText>
            <h1 className='text-3xl text-center mx-4 md:mx-0 font-bold mt-2'>You have Questions, We have Answers</h1>
            <div className='mt-4 space-y-4'>
                <Accordion type="single" collapsible className='md:w-[900px] '>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Will this work form me, if i am not a thought leader?</AccordionTrigger>
                        <AccordionContent>
                            Yes. It adheres to the WAI-ARIA design pattern.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <Accordion type="single" collapsible className=''>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Will this work form me, if i am not a thought leader?</AccordionTrigger>
                        <AccordionContent>
                            Yes. It adheres to the WAI-ARIA design pattern.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion> <Accordion type="single" collapsible className=''>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Will this work form me, if i am not a thought leader?</AccordionTrigger>
                        <AccordionContent>
                            Yes. It adheres to the WAI-ARIA design pattern.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion> <Accordion type="single" collapsible className=''>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Will this work form me, if i am not a thought leader?</AccordionTrigger>
                        <AccordionContent>
                            Yes. It adheres to the WAI-ARIA design pattern.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}
