import Link from "next/link";
import ShimmerButton from "../magicui/shimmer-button";
import { BookCall } from "../ui/bookcall";

export default function RefundPolicy() {
    
    return (
        <main className="bg- py-16  px-4 sm:px-6 lg:px-8 shadow-lg rounded-lg">
            <div className="max-w-4xl mx-auto">
                <div className="md:flex items-center justify-between mb-8 ">
                    <Link href='/'>
                        <img alt="Zapllo Technologies" className="h-7" src="/logo.png" />
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
                <div className="space-y-6 mt-12 text-[#676B93]">
                    <section>
                        <h1 className="text-3xl text-start mb-2 font-bold mt-8 text-gray-400">Refund Policy</h1>

                        <h2 className="text-lg font-medium mb-2">At Zapllo Technologies Private Limited, we strive to ensure satisfaction with our services. However, we understand that there may be circumstances where a refund is requested. Please see below for our policy on refunds.</h2>
                    </section>
                    <section className="">
                        <h2 className="text-lg font-bold mb-4">Criteria for Eligibility:</h2>
                        <div className="grid grid-cols-1  gap-4 md:grid-cols-3">
                            <div className="">
                                <h2 className="text-lg font-bold mb-2">Completion of Services:</h2>
                                <p>Clients must allow the completion of services before requesting a refund. Refunds cannot be processed for services in progress.</p>
                            </div>
                            <div className="">
                                <h2 className="text-lg font-bold mb-2">Refund Request Window:</h2>
                                <p>A refund must be requested within 30 days of service completion. Requests beyond this period will not be eligible.</p>
                            </div>
                            <div className="">
                                <h2 className="text-lg font-bold mb-2">Requesting a Refund:</h2>
                                <p>To apply for a refund, please send an email to refund@zapllo.com detailing your request. If approved, refunds will be processed within 10 to 15 days.</p>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Non-Refundable Items:</h2>
                        <p>
                            Digital or downloadable items.
                            Services that have been fully rendered.
                            Services delivered or concluded outside the 30-day window.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Questions or Concerns:</h2>
                        <p>
                            For any inquiries or further assistance, please contact our support team at support@zapllo.com. We are here to help.
                        </p>
                    </section>
                </div>
            </div>
            <>
                {/* <div className="mt-8">
                    <Footer />

                </div> */}
            </>
        </main>
    )
}