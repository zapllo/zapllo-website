import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from 'next/navigation'
import Image from "next/image";
import ShimmerButton from "../magicui/shimmer-button";

export const FloatingNav = ({
    navItems,
    className,
}: {
    navItems: {
        name: string;
        link: string;
        icon?: JSX.Element;
    }[];
    className?: string;
}) => {
    const pathname = usePathname();

    // Initialize visible state as true
    const [visible, setVisible] = useState(true);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="flex max-w-5xl fixed top-0 md:top-5 py-3 inset-x-0 mx-auto  border-transparent -white/[0.2] rounded-full bg-[#141841] shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-6  justify-between "

            >
                <motion.div

                    className={cn(
                        "flex max-w-fit fixed top-5 md:top-8 inset-x-0 mx-auto border  dark:border-[#2C2E44] rounded-full bg-[#141841] shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-6 py-2 justify-center space-x-4",
                        className
                    )}
                >
               {navItems.map((navItem: any, idx: number) => (
    <Link
        key={`link=${idx}`}
        href={navItem.link}
        className={cn(
            "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500",
            pathname === navItem.link && "underline-offset-8 decoration-purple-400 " // Apply different style for the current page
        )}
        style={{ position: 'relative' }} // Ensure the parent container has a relative position
    >
        <span className="block sm:hidden">{navItem.icon}</span>
        <span className="hidden sm:block text-md">{navItem.name}</span>
        {/* Glowing effect */}
        {pathname === navItem.link && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 rounded-sm shadow-purple-400 shadow-[4.0px_-2.0px_8.0px_rgba(0,0,0,0.38)]" />
        )}
    </Link>
))}


                </motion.div>

                <div className="py-3">
                    <Image src='/logo.png' height={120} width={120} alt="Zapllo Logo" className="-mt-1" />
                </div>
                <Link
                    href="/dashboard"
                    className="relative inline-fl ex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                >
                  
                        <ShimmerButton className="shadow-2xl">
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-[#1C1F3E] dark:to-[#010313] lg:text-md">
                                Get Started
                            </span>
                        </ShimmerButton>
                 
                </Link>
            </motion.div>
        </AnimatePresence>
    );
};
