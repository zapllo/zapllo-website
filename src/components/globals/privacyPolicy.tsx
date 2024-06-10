import Link from "next/link";
import ShimmerButton from "../magicui/shimmer-button";
import { BookCall } from "../ui/bookcall";
import ShineBorder from "../magicui/shine-border";

export default function PrivacyPolicy() {

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
                        <h1 className="md:text-3xl text-start  mb-6  text-2xl  text-gray-400 md:mt-0 mt-0 font-bold">Privacy Policy</h1>

                        <h2 className="text-lg font-medium mb-2">1. Introduction
                            Welcome to Zapllo! We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how Zapllo (“we,” “our,” “us”) collects, uses, and safeguards your information when you visit our website, www.zapllo.com (“Website”), or use our services.</h2>
                    </section>
                    <section className="">
                        <h2 className="text-lg font-bold mb-4">2. Information We Collect</h2>
                        <div className="grid grid-cols-1  gap-4 md:grid-cols-1">
                            <div className="">

                                <p>2.1 Personal Information: We may collect personal information that you provide to us, including but not limited to:
                                    <li>
                                        Name
                                    </li>
                                    <li>
                                        Email address

                                    </li>
                                    <li>
                                        Phone number

                                    </li>
                                    <li>
                                        Company name

                                    </li>
                                    <li>
                                        Billing information

                                    </li>
                                    <li>
                                        Any other information you choose to provide
                                    </li>
                                </p>
                            </div>
                            <div className="">
                                <h2 className="text-lg font-bold mb-2">2.2 Automatically Collected Information: When you visit our Website, we may automatically collect certain information about your device and usage, including:</h2>
                                <p>
                                    <li>
                                        IP address
                                    </li>
                                    <li>
                                        Browser type

                                    </li>
                                    <li>
                                        Operating system

                                    </li>
                                    <li>
                                        Referring URLs

                                    </li>
                                    <li>
                                        Pages viewed

                                    </li>
                                    <li>
                                        Time spent on our Website

                                    </li>

                                </p>
                            </div>
                            <div className="">
                                <h2 className="text-lg font-bold mb-2">3. How We Use Your Information</h2>
                                <p>We may use the information we collect for various purposes, including:
                                    To provide, operate, and maintain our Website and services
                                    To improve, personalize, and expand our Website and services
                                    To process transactions and send related information
                                    To communicate with you, including responding to your inquiries and sending updates
                                    To send marketing and promotional materials (you may opt-out at any time)
                                    To monitor and analyze usage and trends to improve your experience
                                    To prevent fraudulent transactions and ensure the security of our Website</p>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">4. Sharing Your Information  </h2>
                        <p>
                            We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
                            With your consent
                            To trusted third parties who assist us in operating our Website, conducting our business, or serving our users, provided those parties agree to keep this information confidential
                            To comply with legal obligations, enforce our site policies, or protect our rights, property, or safety
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">5. Data Security</h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">6. Your Data Protection Rights</h2>
                        <p>
                            Depending on your location, you may have the following rights regarding your personal information:
                            The right to access – You have the right to request copies of your personal information.
                            The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.
                            The right to erasure – You have the right to request that we erase your personal information, under certain conditions.
                            The right to restrict processing – You have the right to request that we restrict the processing of your personal information, under certain conditions.
                            The right to object to processing – You have the right to object to our processing of your personal information, under certain conditions.
                            The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">7. Cookies and Tracking Technologies</h2>
                        <p>
                            Our Website may use cookies and similar tracking technologies to enhance your experience. You can set your browser to refuse all or some browser cookies or to alert you when cookies are being sent. However, if you disable or refuse cookies, some parts of our Website may become inaccessible or not function properly.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">8. Third-Party Links</h2>
                        <p>
                            Our Website may contain links to third-party websites. We are not responsible for the privacy practices or the content of those sites. We encourage you to review the privacy policies of these third-party sites.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">9. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">10. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:
                            Email: support@zapllo.com
                            Address: 166A Dum Dum Park, PO - Bangur Avenue, Kolkata, PIN - 700055, West Bengal, India
                            Thank you for choosing Zapllo!


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