'use client'

import Footer from "@/components/globals/Footer";
import AnimatedGradientText from "@/components/magicui/animated-gradient-text";
import { FloatingNavbar } from "@/components/globals/navbar";
import { cn } from "@/lib/utils";
import { Golos_Text, Space_Grotesk } from "next/font/google";
import { TestimonialCards2 } from "@/components/globals/TestimonialCards";
import Image from "next/image";
import Testimonials2 from "@/components/globals/testimonials2";
import { useEffect, useState } from "react";
import MultiStepForm from "@/components/forms/checkoutForm";
import { Clock } from "lucide-react";
import TaskDelegationCard from "@/components/cards/checkoutCards";
import { useRouter } from "next/navigation";

const golos = Golos_Text({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

type PlanKeys = 'Zapllo Tasks' | 'Zapllo Money Saver Bundle' | 'Zapllo Payroll';


export default function Home() {
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
    const [checkoutData, setCheckoutData] = useState<{
        showCheckout: boolean;
        selectedPlan: PlanKeys;
    }>({ showCheckout: false, selectedPlan: 'Zapllo Money Saver Bundle' });

    const router = useRouter();

    const openCheckoutWithPlan = (plan: PlanKeys) => {
        router.push(`/special-offer-checkout?selectedPlan=${plan}`);
    };
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
        // <LoaderLayout>
        <main className="bg-[#] bg-[#05071E] w-full  mx-auto h-full z-10 overflow-hidden">
            <FloatingNavbar />
            <Image
                src="/mask.png"
                height={1000}
                className=" absolute overflow-hidden -mt-40 w-full "
                width={1000}
                alt="Background mask for zapllo automation"
            />

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
                <div className="mb-4 mt-12">
                    <h1 className="text-center  text-4xl font-semibold text-green-500">Zapllo Freedom Sale</h1>
                    <div
                        className={cn(
                            "group mt-6  relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl  px-4 py-1.5 md:text-3xl font-medium   ",
                        )}
                    >
                        <span
                            className={cn(
                                `inline animate- text-8xl text-centera  font-bold bg-gradient-to-r from-[#815BF5] via-[#AD64D0] to-[#FC8929]  bg-clip-text text-transparent`
                            )}
                        >
                            Up To 50% Off For 1 year
                        </span>
                    </div>
                    <div className="w-full flex justify-center mt-6 p-2 ">
                        <p className="text-center w-1/2 text-[#676B93] ">Lock in our best-ever price and get access to every new feature, For an year. This
                            one-time Offer ends soon. Act now before it&apos;s gone for good!</p>
                    </div>
                    <div className="w-full flex cursor-pointer  justify-center mt-8">
                        <a href="#cards">
                            <div
                                className={cn(
                                    "group rounded-full border border-black/5  transition-all ease-in  text-base w-fit px-4 py-2 text-white  cursor-pointer  dark:border-white/5 dark:hover:text-white dark:bg-gradient-to-r from-[#815BF5] to-[#5E29FF] dark:hover:bg-blue-800",
                                )}
                            >
                                Yes, Tell me More!
                            </div></a>
                    </div>
                </div>
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

            {/* Pricing Cards */}
            <div className="mt-12 bg-[#05071E]  mx-4 flex flex-col items-center gap-8">
                <div className="grid grid-cols-3 w-full max-w-7xl   justify-center gap-12 relative">
                    {/* Left Card */}
                    <div className="bg-[#0A0D28] mt-8 border rounded-[50px_50px_50px_50px] w-full   p-6 text-white relative z-10 shadow-lg">
                        <div className="absolute -top-0 right-0 w-32 bg-gradient-to-r from-[#815BF5] to-[#FC8929] px-4 py-1 rounded-[0_50px_0_20px] text-sm font-thin text-white">
                            Get Flat 50% OFF
                        </div>

                        <h2
                            className="font-golosText text-lg mt-4"

                        >
                            Zapllo Tasks
                        </h2>

                        <div className="flex items-end mt-4">
                            <p
                                className="text-5xl font-semibold"

                            >
                                ₹4000
                            </p>
                            <span
                                className="ml-2 text-lg"
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    lineHeight: "24px",
                                    color: "#676B93",
                                }}
                            >
                                / per user per year
                            </span>
                        </div>

                        <p
                            className="mt-2"
                            style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                lineHeight: "24px",
                            }}
                        >
                            Save 4 hours per day for each employee
                        </p>
                        <div
                            className="mt-4"
                            style={{
                                borderTop: "1px solid #424882",
                                width: "100%",
                            }}
                        ></div>

                        <ul className="mt-4 space-y-3">
                            {[
                                "AutomateTask - Task Delegation App",
                                "AutomateWA - Official WhatsApp API & Marketing Software",

                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 items-center">
                                    <img src="/icons/tick.png" />
                                    <span
                                        className="text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                            {[
                                "AutomateCRM - Leads Management App",
                                "AutomateAttendance - Attendance Tracking App",
                                "AutomateLeaves - Leave Management App",

                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 items-center">
                                    <img src='/icons/crosss.png' />
                                    <span
                                        className="text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div
                            className="mt-4"
                            style={{
                                borderTop: "1px solid #424882",
                                width: "100%",
                            }}
                        ></div>
                        <p
                            className="text-center mt-2 line-through"
                            style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                lineHeight: "24px",
                                color: "#F13535",
                            }}
                        >
                            ₹4000 per user per year
                        </p>
                        <button onClick={() => openCheckoutWithPlan('Zapllo Tasks')} className="mt-6 w-full py-2 border-2 border-primary rounded-full font-semibold   transition-colors">
                            Get Task Delegation App
                        </button>
                    </div>
                    {/* Middle Card */}
                    <div className="p-[2px] bg-gradient-to-r from-[#815BF5] to-[#FC8929] rounded-[50px]">
                        <div
                            className="bg-white rounded-[50px] h-full mb-12 w-full p-8 text-[#05071E] relative z-20 shadow-lg"
                        >
                            {/* Discount Tag */}
                            <div className="absolute  -top-0 right-0 bg-gradient-to-r from-[#815BF5] to-[#FC8929] px-4 py-1 w-32 rounded-[0_50px_0_20px] text-sm  font-thin text-white">
                                Get Flat 50% OFF
                            </div>

                            {/* Title */}
                            <h2 className="font-golosText text-lg mt-4">
                                Zapllo Money Saver Bundle
                            </h2>

                            {/* Price */}
                            <div className="flex items-end mt-4">
                                <p className="text-5xl font-bold">₹6000</p>
                                <span className="ml-2 text-lg text-[#676B93]" style={{ fontSize: "16px", fontWeight: "400", lineHeight: "24px" }}>
                                    / per user per year
                                </span>
                            </div>

                            {/* Description */}
                            <p className="mt-2 text-[#05071E]" style={{ fontSize: "16px", fontWeight: "400", lineHeight: "24px" }}>
                                2X Your Revenue & Sales Team Performance
                            </p>

                            {/* Divider Line */}
                            <div className="mt-4 border-t border-[#424882]"></div>

                            {/* Feature List */}
                            <ul className="mt-4 space-y-3">
                                {[
                                    "AutomateTask - Task Delegation App",
                                    "AutomateCRM - Leads Management App",
                                    "AutomateAttendance - Attendance Tracking App",
                                    "AutomateLeaves - Leave Management App",
                                    "AutomateWA - Official WhatsApp API & Marketing Software",
                                ].map((item, index) => (
                                    <li key={index} className="flex gap-2 items-center">
                                        <img src="/icons/tick.png" />
                                        <span className="text-sm font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Divider Line */}
                            <div className="mt-4 border-t border-[#424882]"></div>

                            {/* Original Price */}
                            <p className="text-center mt-2 line-through text-[#F13535]" style={{ fontSize: "16px", fontWeight: "400", lineHeight: "24px" }}>
                                ₹12000 per user per year
                            </p>

                            {/* CTA Button */}
                            <button
                                className="mt-6 w-full py-3 rounded-full font-semibold text-white"
                                onClick={() => openCheckoutWithPlan('Zapllo Money Saver Bundle')}
                                style={{
                                    background: "radial-gradient(51.84% 97.12% at 50% 100%, #A587FF 0%, #5E29FF 100%)",
                                    borderTop: "1px solid #A485FF",
                                }}
                            >
                                Get Money Saver Bundle
                            </button>
                        </div>
                    </div>

                    {/* Right Card */}
                    <div className="bg-[#0A0D28] border rounded-[50px_50px_50px_50px] w-full mt-8  p-6 text-white relative z-10 shadow-lg">
                        <div className="absolute -top-0 right-0 w-32 bg-gradient-to-r from-[#815BF5] to-[#FC8929] px-4 py-1 rounded-[0_50px_0_20px] text-sm font-thin text-white">
                            Get Flat 50% OFF
                        </div>
                        {/* <h2 className="text-2xl font-bold mt-4">Zapllo Payroll</h2> */}
                        <h2
                            className=" text-lg mt-4"

                        >
                            Zapllo Payroll
                        </h2>
                        <div className="flex items-end mt-4">
                            <p
                                className="text-5xl font-semibold"

                            >
                                ₹2000
                            </p>
                            <span
                                className="ml-2 text-lg"
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    lineHeight: "24px",
                                    color: "#676B93",
                                }}
                            >
                                / per user per year
                            </span>
                        </div>

                        <p
                            className="mt-2"
                            style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                lineHeight: "24px",
                            }}
                        >
                            Tasks, Leave & Attendance + CRM
                        </p>

                        <div
                            className="mt-4"
                            style={{
                                borderTop: "1px solid #424882",
                                width: "100%",
                            }}
                        ></div>

                        <ul className="mt-4 space-y-3">
                            {[
                                "AutomateCRM - Leads Management App",
                                "AutomateWA - Official WhatsApp API & Marketing Software",
                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 items-center">
                                    <img src="/icons/tick.png" />
                                    <span
                                        className="text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                            {[
                                "AutomateTask - Task Delegation App",
                                "AutomateAttendance - Attendance Tracking App",
                                "AutomateLeaves - Leave Management App",
                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 items-center">
                                    <img src="/icons/crosss.png" />
                                    <span
                                        className="text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div
                            className="mt-4"
                            style={{
                                borderTop: "1px solid #424882",
                                width: "100%",
                            }}
                        ></div>

                        <p
                            className="text-center mt-2 line-through"
                            style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                lineHeight: "24px",
                                color: "#F13535",
                            }}
                        >
                            ₹6000 per user per year
                        </p>

                        <button onClick={() => openCheckoutWithPlan('Zapllo Payroll')} className="mt-6 w-full py-2 border-2 border-primary rounded-full font-semibold transition-colors">
                            Get Payroll App
                        </button>
                    </div>
                </div>
            </div>

            {/* <img src="light.png" className="-mt-72 h-96 w-[50%]" /> */}

            {/* Testimonial Cards */}

            <div className="justify-center mt-12  flex">
                <Testimonials2 />
            </div>

            {/* Buttons */}

            <div className="w-full flex justify-center ">
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

            {/* Zapllo Task Div */}
            <div>
                <div className="flex flex-col items-center justify-center mt-20">
                    {/* ZaplloTask Gradient Text */}
                    <h2
                        className="font-spaceGrotesk font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#815BF5] to-[#FC8929]"
                    >
                        ZaplloTask
                    </h2>

                    {/* Task Delegation App Title */}
                    <h1
                        className="font-spaceGrotesk font-extrabold text-white mt-2 text-center"
                        style={{
                            fontSize: "46px",
                            lineHeight: "58.7px",
                            width: "451px",
                            height: "59px",
                        }}
                    >
                        Task Delegation App
                    </h1>

                    {/* Subtitle Text */}
                    <p
                        className="font-golosText text-white text-center mt-2"
                        style={{
                            fontSize: "17px",
                            lineHeight: "30px",
                            width: "1004px",
                        }}
                    >
                        Save 4 hours per day for each team member
                    </p>
                </div>
                <div>
                    <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 py-16">
                        {/* Left Side Image */}
                        <div className="bg-[#0A0D28] p-8 rounded-lg w-full md:w-1/3 flex items-center justify-center">
                            <img
                                // src="/path-to-image.png" // Replace with actual path
                                src="/book.png"
                                alt="Book Cover Placeholder"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Right Side Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-2/3">
                            {[
                                {
                                    title: "Delegate Tasks",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "WhatsApp Notifications",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Task Reminders",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Repeated Tasks",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Team Performance",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Voice Notes",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-[#0B0C24] p-6 rounded-lg border border-[#37384B] flex items-start space-x-4"
                                >
                                    {/* <span className="text-[#FC8929] text-2xl">✔️</span> */}
                                    <img
                                        src="/tick.png" // Replace with actual path
                                        alt="Tick Icon"
                                        className="flex-shrink-0"
                                        style={{
                                            width: "20.4px",
                                            height: "20.4px",
                                            marginTop: "5px", // Adjust as needed to move downward
                                            marginLeft: "5px", // Adjust as needed to move to the right
                                        }}
                                    />
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-[#676B93] mt-2">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto flex flex-col items-center gap-6 ">
                    {/* Total Value Text */}
                    <p
                        className="text-center text-white font-golosText"
                        style={{
                            fontSize: "24px",
                            fontWeight: "400",
                            lineHeight: "28.8px",
                        }}
                    >
                        Total Value - <span style={{ fontWeight: "700" }}>₹50,000</span> per
                        employee
                    </p>

                    {/* Get Freedom Offer Button */}
                    <a href="#cards">
                        <button
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white font-semibold transition-all"
                            style={{
                                width: "328px",
                                height: "56px",
                                background:
                                    "radial-gradient(51.84% 97.12% at 50% 100%, #A587FF 0%, #5E29FF 100%)",
                                borderBottom: "1px solid #A485FF",
                            }}
                        >
                            Get Freedom Offer Now
                        </button>
                    </a>
                </div>
            </div>

            <div>
                <div className="flex flex-col items-center justify-center mt-20">
                    {/* ZaplloTask Gradient Text */}
                    <h2
                        className="font-spaceGrotesk font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#815BF5] to-[#FC8929]"
                        style={{
                            width: "164px",
                            height: "41px",
                            lineHeight: "40.83px",
                            textAlign: "left",
                        }}
                    >
                        ZaplloTask
                    </h2>

                    {/* Task Delegation App Title */}
                    <h1
                        className="font-spaceGrotesk font-extrabold text-white mt-2 text-center"
                        style={{
                            fontSize: "46px",
                            lineHeight: "58.7px",
                            width: "451px",
                            height: "59px",
                        }}
                    >
                        Task Delegation App
                    </h1>

                    {/* Subtitle Text */}
                    <p
                        className="font-golosText text-white text-center mt-2"
                        style={{
                            fontSize: "17px",
                            lineHeight: "30px",
                            width: "1004px",
                        }}
                    >
                        Save 4 hours per day for each team member
                    </p>
                </div>
                <div>
                    <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 py-16">
                        {/* Left Side Image */}
                        <div className="bg-[#0A0D28] p-8 rounded-lg w-full md:w-1/3 flex items-center justify-center">
                            <img
                                // src="/path-to-image.png" // Replace with actual path
                                src="/book.png"
                                alt="Book Cover Placeholder"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Right Side Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-2/3">
                            {[
                                {
                                    title: "Delegate Tasks",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "WhatsApp Notifications",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Task Reminders",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Repeated Tasks",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Team Performance",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Voice Notes",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-[#0B0C24] p-6 rounded-lg border border-[#37384B] flex items-start space-x-4"
                                >
                                    {/* <span className="text-[#FC8929] text-2xl">✔️</span> */}
                                    <img
                                        src="/tick.png" // Replace with actual path
                                        alt="Tick Icon"
                                        className="flex-shrink-0"
                                        style={{
                                            width: "20.4px",
                                            height: "20.4px",
                                            marginTop: "5px", // Adjust as needed to move downward
                                            marginLeft: "5px", // Adjust as needed to move to the right
                                        }}
                                    />
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-[#676B93] mt-2">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto flex flex-col items-center gap-6 ">
                    {/* Total Value Text */}
                    <p
                        className="text-center text-white font-golosText"
                        style={{
                            fontSize: "24px",
                            fontWeight: "400",
                            lineHeight: "28.8px",
                        }}
                    >
                        Total Value - <span style={{ fontWeight: "700" }}>₹50,000</span> per
                        employee
                    </p>

                    {/* Get Freedom Offer Button */}
                    <a href="#cards">
                        <button
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white font-semibold transition-all"
                            style={{
                                width: "328px",
                                height: "56px",
                                background:
                                    "radial-gradient(51.84% 97.12% at 50% 100%, #A587FF 0%, #5E29FF 100%)",
                                borderBottom: "1px solid #A485FF",
                            }}
                        >
                            {/* Uncomment and replace with the actual icon path if needed */}
                            {/* <Image
    src="/path-to-phone-icon.png" // Replace with the actual path to the phone icon
    alt="Phone Icon"
    width={24}
    height={24}
  /> */}
                            Get Freedom Offer Now
                        </button>
                    </a>
                </div>
            </div>

            <div>
                <div className="flex flex-col items-center justify-center mt-20">
                    {/* ZaplloTask Gradient Text */}
                    <h2
                        className="font-spaceGrotesk font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#815BF5] to-[#FC8929]"
                        style={{
                            width: "164px",
                            height: "41px",
                            lineHeight: "40.83px",
                            textAlign: "left",
                        }}
                    >
                        ZaplloTask
                    </h2>

                    {/* Task Delegation App Title */}
                    <h1
                        className="font-spaceGrotesk font-extrabold text-white mt-2 text-center"
                        style={{
                            fontSize: "46px",
                            lineHeight: "58.7px",
                            width: "451px",
                            height: "59px",
                        }}
                    >
                        Task Delegation App
                    </h1>

                    {/* Subtitle Text */}
                    <p
                        className="font-golosText text-white text-center mt-2"
                        style={{
                            fontSize: "17px",
                            lineHeight: "30px",
                            width: "1004px",
                        }}
                    >
                        Save 4 hours per day for each team member
                    </p>
                </div>
                <div>
                    <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 py-16">
                        {/* Left Side Image */}
                        <div className="bg-[#0A0D28] p-8 rounded-lg w-full md:w-1/3 flex items-center justify-center">
                            <img
                                // src="/path-to-image.png" // Replace with actual path
                                src="/book.png"
                                alt="Book Cover Placeholder"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Right Side Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-2/3">
                            {[
                                {
                                    title: "Delegate Tasks",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "WhatsApp Notifications",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Task Reminders",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Repeated Tasks",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Team Performance",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Voice Notes",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-[#0B0C24] p-6 rounded-lg border border-[#37384B] flex items-start space-x-4"
                                >
                                    {/* <span className="text-[#FC8929] text-2xl">✔️</span> */}
                                    <img
                                        src="/tick.png" // Replace with actual path
                                        alt="Tick Icon"
                                        className="flex-shrink-0"
                                        style={{
                                            width: "20.4px",
                                            height: "20.4px",
                                            marginTop: "5px", // Adjust as needed to move downward
                                            marginLeft: "5px", // Adjust as needed to move to the right
                                        }}
                                    />
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-[#676B93] mt-2">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto flex flex-col items-center gap-6 ">
                    {/* Total Value Text */}
                    <p
                        className="text-center text-white font-golosText"
                        style={{
                            fontSize: "24px",
                            fontWeight: "400",
                            lineHeight: "28.8px",
                        }}
                    >
                        Total Value - <span style={{ fontWeight: "700" }}>₹50,000</span> per
                        employee
                    </p>

                    {/* Get Freedom Offer Button */}
                    <a href="#cards2">
                        <button
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white font-semibold transition-all"
                            style={{
                                width: "328px",
                                height: "56px",
                                background:
                                    "radial-gradient(51.84% 97.12% at 50% 100%, #A587FF 0%, #5E29FF 100%)",
                                borderBottom: "1px solid #A485FF",
                            }}
                        >
                            {/* Uncomment and replace with the actual icon path if needed */}
                            {/* <Image
    src="/path-to-phone-icon.png" // Replace with the actual path to the phone icon
    alt="Phone Icon"
    width={24}
    height={24}
  /> */}
                            Get Freedom Offer Now
                        </button>
                    </a>
                </div>
            </div>

            <div>
                <div className="flex flex-col items-center justify-center mt-20">
                    {/* ZaplloTask Gradient Text */}
                    <h2
                        className="font-spaceGrotesk font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#815BF5] to-[#FC8929]"
                        style={{
                            width: "164px",
                            height: "41px",
                            lineHeight: "40.83px",
                            textAlign: "left",
                        }}
                    >
                        ZaplloTask
                    </h2>

                    {/* Task Delegation App Title */}
                    <h1
                        className="font-spaceGrotesk font-extrabold text-white mt-2 text-center"
                        style={{
                            fontSize: "46px",
                            lineHeight: "58.7px",
                            width: "451px",
                            height: "59px",
                        }}
                    >
                        Task Delegation App
                    </h1>

                    {/* Subtitle Text */}
                    <p
                        className="font-golosText text-white text-center mt-2"
                        style={{
                            fontSize: "17px",
                            lineHeight: "30px",
                            width: "1004px",
                        }}
                    >
                        Save 4 hours per day for each team member
                    </p>
                </div>
                <div>
                    <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 py-16">
                        {/* Left Side Image */}
                        <div className="bg-[#0A0D28] p-8 rounded-lg w-full md:w-1/3 flex items-center justify-center">
                            <img
                                // src="/path-to-image.png" // Replace with actual path
                                src="/book.png"
                                alt="Book Cover Placeholder"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Right Side Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-2/3">
                            {[
                                {
                                    title: "Delegate Tasks",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "WhatsApp Notifications",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Task Reminders",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Repeated Tasks",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Team Performance",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                                {
                                    title: "Voice Notes",
                                    description:
                                        "Track all your tasks to never miss out on any tasks. Assign tasks to your teammates with deadlines, category, and priority.",
                                },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-[#0B0C24] p-6 rounded-lg border border-[#37384B] flex items-start space-x-4"
                                >
                                    {/* <span className="text-[#FC8929] text-2xl">✔️</span> */}
                                    <img
                                        src="/tick.png" // Replace with actual path
                                        alt="Tick Icon"
                                        className="flex-shrink-0"
                                        style={{
                                            width: "20.4px",
                                            height: "20.4px",
                                            marginTop: "5px", // Adjust as needed to move downward
                                            marginLeft: "5px", // Adjust as needed to move to the right
                                        }}
                                    />
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-[#676B93] mt-2">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto flex flex-col items-center gap-6 ">
                    {/* Total Value Text */}
                    <p
                        className="text-center text-white font-golosText"
                        style={{
                            fontSize: "24px",
                            fontWeight: "400",
                            lineHeight: "28.8px",
                        }}
                    >
                        Total Value - <span style={{ fontWeight: "700" }}>₹50,000</span> per
                        employee
                    </p>

                    {/* Get Freedom Offer Button */}
                    <a href="#cards2">
                        <button
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white font-semibold transition-all"
                            style={{
                                width: "328px",
                                height: "56px",
                                background:
                                    "radial-gradient(51.84% 97.12% at 50% 100%, #A587FF 0%, #5E29FF 100%)",
                                borderBottom: "1px solid #A485FF",
                            }}
                        >
                            {/* Uncomment and replace with the actual icon path if needed */}
                            {/* <Image
    src="/path-to-phone-icon.png" // Replace with the actual path to the phone icon
    alt="Phone Icon"
    width={24}
    height={24}
  /> */}
                            Get Freedom Offer Now
                        </button>
                    </a>
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

                <div id="cards2" className="flex justify-center ">
                    <p
                        className={`max-w-[1000px] text-center mx-4 text-balance md:mx-0 mt-4 md:text-lg leading-relaxed text-[#676B93] ${golos.className}`}
                    >
                        Single Application to Manage Entire Team&apos;s Tasks, Leads,
                        Leaves, and Attendance with WhatsApp Integration!
                    </p>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="mt-12 bg-[#05071E]  mx-4 flex flex-col items-center gap-8">

                <div className="grid grid-cols-3 w-full max-w-7xl   justify-center gap-12 relative">
                    {/* Left Card */}
                    <div className="bg-[#0A0D28] mt-8 border rounded-[50px_50px_50px_50px] w-full   p-6 text-white relative z-10 shadow-lg">
                        <div className="absolute -top-0 right-0 w-32 bg-gradient-to-r from-[#815BF5] to-[#FC8929] px-4 py-1 rounded-[0_50px_0_20px] text-sm font-thin text-white">
                            Get Flat 50% OFF
                        </div>

                        <h2
                            className="font-golosText text-lg mt-4"

                        >
                            Zapllo Tasks
                        </h2>

                        <div className="flex items-end mt-4">
                            <p
                                className="text-5xl font-semibold"

                            >
                                ₹4000
                            </p>
                            <span
                                className="ml-2 text-lg"
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    lineHeight: "24px",
                                    color: "#676B93",
                                }}
                            >
                                / per user per year
                            </span>
                        </div>

                        <p
                            className="mt-2"
                            style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                lineHeight: "24px",
                            }}
                        >
                            Save 4 hours per day for each employee
                        </p>
                        <div
                            className="mt-4"
                            style={{
                                borderTop: "1px solid #424882",
                                width: "100%",
                            }}
                        ></div>

                        <ul className="mt-4 space-y-3">
                            {[
                                "AutomateTask - Task Delegation App",
                                "AutomateWA - Official WhatsApp API & Marketing Software",

                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 items-center">
                                    <img src="/icons/tick.png" />
                                    <span
                                        className="text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                            {[
                                "AutomateCRM - Leads Management App",
                                "AutomateAttendance - Attendance Tracking App",
                                "AutomateLeaves - Leave Management App",

                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 items-center">
                                    <img src='/icons/crosss.png' />
                                    <span
                                        className="text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div
                            className="mt-4"
                            style={{
                                borderTop: "1px solid #424882",
                                width: "100%",
                            }}
                        ></div>
                        <p
                            className="text-center mt-2 line-through"
                            style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                lineHeight: "24px",
                                color: "#F13535",
                            }}
                        >
                            ₹4000 per user per year
                        </p>
                        <button onClick={() => openCheckoutWithPlan('Zapllo Tasks')} className="mt-6 w-full py-2 border-2 border-primary rounded-full font-semibold   transition-colors">
                            Get Task Delegation App
                        </button>
                    </div>
                    {/* Middle Card */}
                    <div className="p-[2px] bg-gradient-to-r from-[#815BF5] to-[#FC8929] rounded-[50px]">
                        <div
                            className="bg-white rounded-[50px] h-full mb-12 w-full p-8 text-[#05071E] relative z-20 shadow-lg"
                        >
                            {/* Discount Tag */}
                            <div className="absolute  -top-0 right-0 bg-gradient-to-r from-[#815BF5] to-[#FC8929] px-4 py-1 w-32 rounded-[0_50px_0_20px] text-sm  font-thin text-white">
                                Get Flat 50% OFF
                            </div>

                            {/* Title */}
                            <h2 className="font-golosText text-lg mt-4">
                                Zapllo Money Saver Bundle
                            </h2>

                            {/* Price */}
                            <div className="flex items-end mt-4">
                                <p className="text-5xl font-bold">₹6000</p>
                                <span className="ml-2 text-lg text-[#676B93]" style={{ fontSize: "16px", fontWeight: "400", lineHeight: "24px" }}>
                                    / per user per year
                                </span>
                            </div>

                            {/* Description */}
                            <p className="mt-2 text-[#05071E]" style={{ fontSize: "16px", fontWeight: "400", lineHeight: "24px" }}>
                                2X Your Revenue & Sales Team Performance
                            </p>

                            {/* Divider Line */}
                            <div className="mt-4 border-t border-[#424882]"></div>

                            {/* Feature List */}
                            <ul className="mt-4 space-y-3">
                                {[
                                    "AutomateTask - Task Delegation App",
                                    "AutomateCRM - Leads Management App",
                                    "AutomateAttendance - Attendance Tracking App",
                                    "AutomateLeaves - Leave Management App",
                                    "AutomateWA - Official WhatsApp API & Marketing Software",
                                ].map((item, index) => (
                                    <li key={index} className="flex gap-2 items-center">
                                        <img src="/icons/tick.png" />
                                        <span className="text-sm font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Divider Line */}
                            <div className="mt-4 border-t border-[#424882]"></div>

                            {/* Original Price */}
                            <p className="text-center mt-2 line-through text-[#F13535]" style={{ fontSize: "16px", fontWeight: "400", lineHeight: "24px" }}>
                                ₹12000 per user per year
                            </p>

                            {/* CTA Button */}
                            <button
                                className="mt-6 w-full py-3 rounded-full font-semibold text-white"
                                onClick={() => openCheckoutWithPlan('Zapllo Money Saver Bundle')}
                                style={{
                                    background: "radial-gradient(51.84% 97.12% at 50% 100%, #A587FF 0%, #5E29FF 100%)",
                                    borderTop: "1px solid #A485FF",
                                }}
                            >
                                Get Money Saver Bundle
                            </button>
                        </div>
                    </div>

                    {/* Right Card */}
                    <div className="bg-[#0A0D28] border rounded-[50px_50px_50px_50px] w-full mt-8  p-6 text-white relative z-10 shadow-lg">
                        <div className="absolute -top-0 right-0 w-32 bg-gradient-to-r from-[#815BF5] to-[#FC8929] px-4 py-1 rounded-[0_50px_0_20px] text-sm font-thin text-white">
                            Get Flat 50% OFF
                        </div>
                        {/* <h2 className="text-2xl font-bold mt-4">Zapllo Payroll</h2> */}
                        <h2
                            className=" text-lg mt-4"

                        >
                            Zapllo Payroll
                        </h2>
                        <div className="flex items-end mt-4">
                            <p
                                className="text-5xl font-semibold"

                            >
                                ₹2000
                            </p>
                            <span
                                className="ml-2 text-lg"
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "400",
                                    lineHeight: "24px",
                                    color: "#676B93",
                                }}
                            >
                                / per user per year
                            </span>
                        </div>

                        <p
                            className="mt-2"
                            style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                lineHeight: "24px",
                            }}
                        >
                            Tasks, Leave & Attendance + CRM
                        </p>

                        <div
                            className="mt-4"
                            style={{
                                borderTop: "1px solid #424882",
                                width: "100%",
                            }}
                        ></div>

                        <ul className="mt-4 space-y-3">
                            {[
                                "AutomateCRM - Leads Management App",
                                "AutomateWA - Official WhatsApp API & Marketing Software",
                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 items-center">
                                    <img src="/icons/tick.png" />
                                    <span
                                        className="text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                            {[
                                "AutomateTask - Task Delegation App",
                                "AutomateAttendance - Attendance Tracking App",
                                "AutomateLeaves - Leave Management App",
                            ].map((item, index) => (
                                <li key={index} className="flex gap-2 items-center">
                                    <img src="/icons/crosss.png" />
                                    <span
                                        className="text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div
                            className="mt-4"
                            style={{
                                borderTop: "1px solid #424882",
                                width: "100%",
                            }}
                        ></div>

                        <p
                            className="text-center mt-2 line-through"
                            style={{
                                fontSize: "16px",
                                fontWeight: "400",
                                lineHeight: "24px",
                                color: "#F13535",
                            }}
                        >
                            ₹6000 per user per year
                        </p>

                        <button onClick={() => openCheckoutWithPlan('Zapllo Payroll')} className="mt-6 w-full py-2 border-2 border-primary rounded-full font-semibold transition-colors">
                            Get Payroll App
                        </button>
                    </div>
                </div>
            </div>


            <div className="flex bg-[#04061E]  mt-56 justify-center">
                <Footer />
            </div>
        </main >
        // </LoaderLayout>
    );
}
