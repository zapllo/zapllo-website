"use client";

import React, { useEffect, useState } from "react";
import { MovingCards } from './movingcards'

export function TestimonialCards() {
    return (
        <div className="h-[25rem] rounded-md flex flex-col antialiased  dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
            <MovingCards
                items={testimonials}
                direction="right"
                speed="slow"
            />
        </div>
    );
}

const testimonials = [
    {
        quote:
            "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief,  despair.",
        name: "Dianne Russell",
        title: "Marketing Coordinator",
        image: 'deep.png'
    },
    {
        quote:
            "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it  winter of despair.",
        name: "Dianne Russell",
        title: "Marketing Coordinator",
        image: ''
    },
    {
        quote:
            "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness,as the winter of despair.",
        name: "Dianne Russell",
        title: "Marketing Coordinator",
        image: '',
    },
    {
        quote:
            "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light,",
        name: "Dianne Russell",
        title: "Marketing Coordinator",
        image: '',
    },
    {
        quote:
            "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, ",
        name: "Dianne Russell",
        title: "Marketing Coordinator",
        image: '',
    },
];
