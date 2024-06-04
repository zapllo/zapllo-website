import Link from "next/link";
// import ShimmerButton from "../magicui/shimmer-button";
import { BookCall } from "../ui/bookcall";
import ShineBorder from "../magicui/shine-border";

export default function ContactUs() {
    return (
        <main className="bg- py-16   px-4 sm:px-6 lg:px-8 shadow-lg rounded-lg">
            <div className="max-w-4xl mx-auto">
                <div className="md:flex items-center justify-between mb-8">
                    <Link href='/'>
                        <img alt="Zapllo Technologies" className="h-7 cursor-pointer" src="/logo.png" />
                    </Link>
                    <div className="md:flex justify-start  mt-6 md:mt-0 gap-2">
                        <div className="scale-90  justify-start flex">
                            <BookCall />

                        </div>
                        <Link
                            href="/dashboard"
                            className="relative inline-fl ex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                        >
                            <ShineBorder borderRadius={50}
                                className="text-center text-xl font-bold capitalize"
                                color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                            >
                                <h1>
                                    Get Started
                                </h1>
                            </ShineBorder>
                        </Link>
                    </div>

                </div>
                <div className="space-y-12 mt-12 text-[#676B93]">
                    <section>
                    <h1 className="md:text-3xl text-start  mb-6  text-2xl  text-gray-400 md:mt-0 mt-0 font-bold">Contact Us</h1>

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