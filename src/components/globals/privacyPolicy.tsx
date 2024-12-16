import Link from "next/link";
import { Button } from "../ui/button";

export default function PrivacyPolicy() {
    return (
        <main className="bg- py-16 px-4 sm:px-6 lg:px-8 shadow-lg rounded-lg">
            <div className="max-w-4xl mx-auto">
                <div className="md:flex items-center justify-between mb-8">
                    <Link href="/">
                        <img alt="Zapllo Technologies" className="h-7 cursor-pointer" src="/logo.png" />
                    </Link>
                    <div className="flex gap-2">
                        <Button className="bg-black hover:border-[#815bf5] border hover:bg-black rounded-full">
                            <Link
                                href="/signup"
                                className="relative m0 text-white font-medium overflow-hidden rounded-full"
                            >
                                <h1>Get Started</h1>
                            </Link>
                        </Button>
                        <Link
                            href="/login"
                            className="relative text-white font-medium overflow-hidden rounded-full"
                        >
                            <Button className="rounded-full">Login</Button>
                        </Link>
                    </div>
                </div>
                <div className="space-y-12 mt-12 text-[#676B93]">
                    <section className="space-y-4">
                        <h1 className="md:text-3xl text-start mb-6 text-2xl text-gray-400 md:mt-0 mt-0 font-bold">Privacy Policy</h1>
                        <p>Last Modified: 19/01/2024</p>
                        <h1 className="md:text-2xl text-start mb-6 text-2xl text-gray-400 md:mt-0 mt-0 font-bold">Introduction</h1>
                        <p>
                            Welcome to the privacy policy of <b>Zapllo Technologies Private Limited</b> (“Zapllo”), governing your use of the website{" "}
                            <Link href="https://www.zapllo.com" className="text-blue-500 underline">https://www.zapllo.com</Link> (“Website”). Safeguarding your privacy is paramount to us, and this policy outlines our commitment to protecting the information you entrust to us.
                        </p>
                        <p>
                            This document constitutes a legally binding agreement between you and Zapllo, established under the provisions of the Information Technology Act, 2000, and its associated regulations. It meticulously details how we collect, utilize, safeguard, and disclose the information gathered from visitors to our Website.
                        </p>
                        <p>
                            Your access to and utilization of our Website signifies your unequivocal acceptance of the terms laid out in this privacy policy. Should you disagree with any aspect of these terms, we kindly request that you refrain from using our Website.
                        </p>
                        <p>
                            We urge you to thoroughly review this policy to fully comprehend our practices regarding your information. Should you have any inquiries or require clarifications regarding our privacy practices, please do not hesitate to contact us at{" "}
                            <a href="mailto:support@zapllo.com" className="text-blue-500 underline">support@zapllo.com</a> or call us at +91-9836630366. Your privacy and trust are of utmost importance to us.
                        </p>
                    </section>
                    <section className="space-y-4">
                        <h1 className="md:text-2xl text-start mb-6 text-2xl text-gray-400 md:mt-0 mt-0 font-bold">Sources of Information Collection</h1>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <b>User Profile Creation:</b> When users register, we collect fields like name, email, phone number, industry, and number of employees.
                            </li>
                            <li>
                                <b>Task Delegation:</b> Users input tasks and activities assigned to others, which are stored in our software.
                            </li>
                            <li>
                                <b>Leave & Attendance:</b> Users upload three photos for attendance purposes, and when marking attendance, geo-location data is captured.
                            </li>
                            <li>
                                <b>CRM:</b> Users input customer inquiries, customer data, and product information into our Customer Relationship Management (CRM) system.
                            </li>
                            <li>
                                <b>Data Storage:</b> All data is securely stored on our cloud servers with full protection measures in place.
                            </li>
                            <li>
                                <b>Business Dashboards/Reports:</b> Customers can access various business dashboards and reports based on the data they enter.
                            </li>
                            <li>
                                <b>Data Sharing:</b> We do not share any data with external third parties, vendors, or customers.
                            </li>
                            <li>
                                <b>User Activities:</b> User activities such as task delegation, leave applications, approval processes, attendance marking, and link management may involve access to features like audio recording for task delegation and camera access for attendance purposes.
                            </li>
                            <li>
                                <b>External Data Usage:</b> Data created within our software is not shared externally with any third parties, vendors, or customers.
                            </li>
                            <li>
                                <b>Secure Data Hosting:</b> Data is hosted on secure servers with robust protective measures to ensure confidentiality and integrity.
                            </li>
                        </ul>
                    </section>
                
                </div>
            </div>
        </main>
    );
}
