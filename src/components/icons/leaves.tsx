import clsx from 'clsx'
import { Calendar, CalendarClock } from 'lucide-react'
import React from 'react'

type Props = {
    selected: boolean
}

const Leaves = ({ selected }: Props) => {
    return (
        <CalendarClock  className='h-3' />

    )
}

export default Leaves
