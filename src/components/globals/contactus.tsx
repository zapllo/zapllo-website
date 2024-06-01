"use client"

import Link from "next/link";
import ShimmerButton from "../magicui/shimmer-button";
import { BookCall } from "../ui/bookcall";

export default function ContactUs() {
    return (
        <main className="bg- py-16   px-4 sm:px-6 lg:px-8 shadow-lg rounded-lg">
            
            <div className="max-w-4xl mx-auto">
                <div className="md:flex items-center justify-between mb-8">
                    <Link href='/'>
                        <img alt="Zapllo Technologies" className="h-7 cursor-pointer" src="/logo.png" />
                    </Link>
                    <div className="flex gap-2">
                        <div className="scale-90">
                            <BookCall />

                        </div>
                        <ShimmerButton className="shadow-2xl">
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-[#1C1F3E] dark:to-[#010313] lg:text-md">
                                Get Started
                            </span>
                        </ShimmerButton>
                    </div>

                </div>
                <div className="space-y-6 text-[#676B93]">
                    <section>
                        <h1 className="md:text-3xl text-center mb-2 text-2xl  text-gray-400 md:mt-0 mt-8 font-bold">Contact Us</h1>

                        <p className="mb-2">
                            For contacting Zapllo Technologies Private Limited, you can reach out through the following methods for support, inquiries, or any assistance you might need regarding their services:
                        </p>

                        <p className="mb-2">
                            Email: support@zapllo.com
                        </p>
                        <p className="mb-2">

                            Address: 166A Dum Dum Park, PO - Bangur Avenue, Kolkata - 700055, India
                        </p>
                        <p className="mb-2">
                            Feel free to contact them for any questions or support related to their software consultancy/development, automation solutions, training, or any other services they offer.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}