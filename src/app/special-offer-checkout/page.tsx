'use client';

import Footer from "@/components/globals/Footer";
import { FloatingNavbar } from "@/components/globals/navbar";
import MultiStepForm from "@/components/forms/checkoutForm";
import { useSearchParams } from 'next/navigation';
import TaskDelegationCard from "@/components/cards/checkoutCards";
import Testimonials2 from "@/components/globals/testimonials2";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Golos_Text } from "next/font/google";
const golos = Golos_Text({ subsets: ["latin"] });


type PlanKeys = 'Zapllo Tasks' | 'Zapllo Money Saver Bundle' | 'Zapllo Payroll';


export default function SpecialOfferCheckout() {
    const searchParams = useSearchParams();
    const selectedPlan = searchParams.get('selectedPlan') || 'Zapllo Money Saver Bundle';
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime: any) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        // Clear interval on component unmount
        return () => clearInterval(timer);
    }, []);

    // Format the time as MM:SS
    const formatTime = (time: any) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <main className="bg-[#05071E] w-full  mx-auto h-full overflow-hidden">
            <FloatingNavbar />
            {/* Freedom Code */}

            <div className="w-full py-2 bg-gradient-to-r from-[#815BF5] via-[#9D5DF0] to-[#FC8929] flex items-center justify-center mt-32 ">
                <p className="text-white text-lg font-medium mr-4">
                    Use Code <span className="font-bold">&quot;FREEDOM&quot;</span> to Get
                    Flat OFF
                </p>
                <div className="bg-white items-center text-[#05071E] flex gap-1 font-semibold px-4 py-1 rounded-md">
                    <Clock className="h-4" />  {formatTime(timeLeft)}
                </div>
            </div>

            {/* Run Your Business */}

            <div className="  bg-[#05071E]">
              
                <div className="z-10 flex items-center justify-center">
                    <div
                        className={cn(
                            "group mt-24 relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl  px-4 py-1.5 md:text-3xl font-medium   ",

                        )}
                    >
                        <span
                            className={cn(
                                `inline animate-  text-center md:text-3xl  font-bold bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929]  bg-clip-text text-transparent`
                            )}
                        >
                            Run your Business on Autopilot
                        </span>
                    </div>
                </div>


                <div className="flex justify-center">
                    <h1 className="text-center   bg-clip-text  font-extrabold  md:text-5xl mt-4   mx-4 md:max-w-[1000px]">
                        Business Workspace for MSMEs
                    </h1>
                </div>

                <div id="cards" className="flex justify-center ">
                    <p
                        className={`max-w-[1000px] text-center mx-4 text-balance md:mx-0 mt-4 md:text-lg leading-relaxed text-[#676B93] ${golos.className}`}
                    >
                        Single Application to Manage Entire Team&apos;s Tasks, Leads,
                        Leaves, and Attendance with WhatsApp Integration!
                    </p>
                </div>
            </div>
            <div className="w-full mt-12 flex justify-center ">
                <div className=" flex  gap-4">
                    {[
                        { title: "Multi User Login" },
                        { title: "WhatsApp Integration" },
                        { title: "Voice Notes" },
                        { title: "Email Integration" },
                        { title: "Whatsapp Reminders" },
                        { title: "Realtime Reports" },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-center px-4  text-sm w-fit  gap-4  py-3 rounded-[20px_20px_20px_20px] text-white font-golosText"
                            style={{
                                width:
                                    feature.title === "WhatsApp Integration" ? "" : "", // Increase width for "WhatsApp Integration"
                                background: "linear-gradient(90deg, #815BF5 0%, #FC8929 100%)",
                            }}
                        >
                            <span className="flex-shrink-0 bg-white pb-1   rounded-full w-6 h-6 flex items-center justify-center text-[#815BF5]">
                                ✔️
                            </span>
                            <span
                                className="text-sm font-normal whitespace-nowrap"
                            >
                                {feature.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="container mx-auto mt-12 py-16">
                <MultiStepForm selectedPlan={selectedPlan as PlanKeys} />
            </div>
            <div className="flex justify-center mb-24 w-full">
                <div className="grid grid-cols-3 gap-8">
                    <TaskDelegationCard
                        title="Zapllo Tasks"
                        features={[
                            "Delegate Unlimited Tasks",
                            "Team Performance Report",
                            "Links Management for your Team",
                            "Email Notifications",
                            "Save more than 4 hours per day"
                        ]}
                    />
                    <TaskDelegationCard
                        title="Zapllo Money Saver Bundle"
                        features={[
                            "Automate Task Management",
                            "Official WhatsApp API Integration",
                            "Enhanced CRM Features",
                            "24/7 Support",
                            "Increased Productivity"
                        ]}
                    />
                    <TaskDelegationCard
                        title="Zapllo Payroll"
                        features={[
                            "Payroll Automation",
                            "Attendance Tracking",
                            "Leave Management",
                            "Detailed Reporting",
                            "Reduce HR Overhead"
                        ]}
                    />
                </div>
            </div>
            <Testimonials2 />
            <Footer />
        </main>
    );
}
