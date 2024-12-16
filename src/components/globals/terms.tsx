import Link from "next/link";
import { BookCall } from "../ui/bookcall";
import ShimmerButton from "../magicui/shimmer-button";
import ShineBorder from "../magicui/shine-border";
import { Button } from "../ui/button";

export default function TermsandConditions() {
    return (
        <main className="bg- py-16   px-4 sm:px-6 lg:px-8 shadow-lg rounded-lg">
            <div className="max-w-4xl mx-auto">
                <div className="md:flex items-center justify-between mb-8">
                    <Link href='/'>
                        <img alt="Zapllo Technologies" className="h-7 cursor-pointer" src="/logo.png" />
                    </Link>
                    <div className="flex gap-2">

                        <Button className="bg-black hover:border-[#815bf5] border hover:bg-black rounded-full">
                            <Link
                                href="/signup"
                                className="relative m0 text-white font-medium    overflow-hidden rounded-full "
                            >
                                <h1>
                                    Get Started
                                </h1>
                            </Link>

                        </Button>
                        <Link
                            href="/login"
                            className="relative  text-white font-medium  overflow-hidden rounded-full  "
                        >

                            <Button className="rounded-full">
                                Login
                            </Button>
                        </Link>
                    </div>

                </div>
                <div className="space-y-12 mt-12 text-[#676B93]">
                    <section>
                        <h1 className="md:text-3xl text-start  mb-6  text-2xl  text-gray-400 md:mt-0 mt-0 font-bold">Terms & Conditions</h1>

                        <h2 className="text-xl font-bold mb-2">Introduction</h2>
                        <p className="">
                            Welcome to Zapllo Technologies Private Limited. By accessing our website or using our services, you agree
                            to be bound by these Terms and Conditions. Please read them carefully.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Services Provided</h2>
                        <p>
                            Zapllo Technologies Private Limited specializes in software consultancy/development, automation solutions,
                            and training. We offer assistance in leveraging Artificial Intelligence, cross-platform integration, and
                            building robust Notion Business Systems.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Use of Our Services</h2>
                        <p>
                            You may use our services only as permitted by law. We may suspend or stop providing our services if you do
                            not comply with our terms or policies.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Service Modifications and Availability</h2>
                        <p>
                            Our services may change from time to time, and we may stop (permanently or temporarily) providing services
                            or any features within our services to you or users generally.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">User Responsibilities</h2>
                        <p>
                            You are responsible for your use of the services and for any consequences thereof. You must ensure that your use of our services is in compliance with all applicable laws and regulations.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Intellectual Property</h2>
                        <p>
                            All content included on our website, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the site, is the property of Zapllo Technologies Private Limited or its suppliers and protected by copyright and international copyright laws.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Disclaimer of Warranties</h2>
                        <p>
                            Our services are provided &quot;as is&quot; and we do not guarantee or warrant the accuracy, completeness, or usefulness of this service, and you are relying on this service at your own risk.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Limitation of Liability</h2>
                        <p>
                            In no event will Zapllo Technologies Private Limited, or its directors, employees, or agents be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with the use of our services.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Governing Law</h2>
                        <p>
                            These Terms and Conditions are governed by the laws of the jurisdiction where Zapllo Technologies Private Limited is established, without regard to its conflict of law provisions.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Changes to Terms and Conditions</h2>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Contact Us</h2>
                        <p>
                            For any questions about these Terms, please contact us.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}