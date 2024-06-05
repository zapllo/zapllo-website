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
            "We are now associated with Zapllo for about 2 years now. Highly recommended",
        name: "Emily Haile",
        title: "Director, Talent & Operations",
        image: 'emily.png'
    },
    {
        quote:
            "I am stunned how automation and AI saved us from putting multiple hours per day on customer onboarding. Deep is magic at developing amazing automations. No doubt he is the best. Highly recommended.",
        name: "Gar Lee",
        title: "Customer Success Daily.Ai",
        image: 'lee.png'
    },
    {
        quote:
            "Shubhodeep is one of our best partners. We have been associated with Zapllo for about 9 months now. They have completely transformed our company operations and internal workflow. Highly recommended.",
        name: "Steve Migley",
        title: "VP Operations RENU Therapy",
        image: 'steve.png',
    },
    {
        quote:
            "Can't really give Zapllo anything less than 10 out of 10. They are the best when it comes to Automation, Gen AI and creating amazing Notion Dashboards.",
        name: "Brennan Townlley",
        title: "CEO Collaboration.Ai",
        image: 'collab.png',
    },
    {
        quote:
            "Deep is amazing and he is an amazing coach when it comes to Business Automaitons.",
        name: "Mike Roberts",
        title: "CEO BeSpoke Media",
        image: 'mike.png',
    },
    {
        quote:
            "I am happy that we found Deep at the first place. I am really grateful to this man for saving us in bad times and helping us getting things tidy for our eCom Business. Very highly recommended.",
        name: "Bill Bachand",
        title: "CEO RENU Therapy",
        image: 'bill.png',
    },
    {
        quote:
            "Never thought how Automation and Notion Systems can enhance a business workflow to such amazing levels.",
        name: "Russ Gaskin",
        title: "CEO WeAreCoCreative",
        image: 'russ.png',
    },
    {
        quote:
            "Deep has been amazing developing and streamlining our workflow at TTA. Highly recommended.",
        name: "Dimitriy Azarenko",
        title: "Co-Founder Top Tier Authentics",
        image: 'dima.png',
    },
];
