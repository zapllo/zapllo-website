import { FloatingNavbar } from "@/components/globals/navbar";
import Business from "@/components/product-components/payroll/Business";
import PayrollFeatures from "@/components/product-components/payroll/Features";
import PayrollHero from "@/components/product-components/payroll/Hero";
import Image from "next/image";

export default function Home() {
    return (
        // <LoaderLayout>
        <main className="bg-[#] bg-[#05071E]  mx-auto h-full z-10 overflow-hidden">
            <FloatingNavbar />
            <Image src='/mask.png' height={1000} className=" absolute overflow-hidden w-full " width={1000} alt="Background mask for zapllo automation" />
            <PayrollHero />
            <Business />
            <PayrollFeatures />
        </main>
    )
};