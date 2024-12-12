import Footer from "@/components/globals/Footer";
import { FloatingNavbar } from "@/components/globals/navbar";
import Benefits from "@/components/product-components/tasks/benefits";
import Business from "@/components/product-components/tasks/Business";
import PayrollFeatures from "@/components/product-components/payroll/Features";
import PayrollHero from "@/components/product-components/payroll/Hero";
import SettingUp4 from "@/components/product-components/tasks/holiday";
import SettingUp3 from "@/components/product-components/tasks/leavetypes";
import SettingUp2 from "@/components/product-components/tasks/registerfaces";
import SaveMore2 from "@/components/product-components/tasks/save2";
import SaveMoreTasks from "@/components/product-components/tasks/save";
import SaveMore from "@/components/product-components/payroll/save";
import SettingUp from "@/components/product-components/tasks/settingup";
import PayrollTestimonials from "@/components/product-components/payroll/testimonials";
import TaskFeatures from "@/components/product-components/tasks/Features";
import TasksHero from "@/components/product-components/tasks/Hero";
import Image from "next/image";

export default function Home() {
    return (
        // <LoaderLayout>
        <main className="bg-[#] bg-[#05071E]  mx-auto h-full z-10 overflow-hidden">
            <FloatingNavbar />
            <Image src='/mask.png' height={1000} className=" absolute overflow-hidden w-full " width={1000} alt="Background mask for zapllo automation" />
            <TasksHero />
            <Business product="Zapllo Tasks App" />
            <TaskFeatures />
            <SettingUp />
            <SettingUp2 />
            <SettingUp3 />
            <SettingUp4 />
            <SaveMore2 />
            <Benefits />
            <div
                className='scroller relative z-20 bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929]  max-w-8xl py-4 mb-4 overflow- space-x-6'
            >
                <h1 className="text-center text-2xl">
                    We are on a mission to help 1 Million MSMEs automate their business and get freedom from daily firefighting.
                </h1>
            </div>
            <PayrollTestimonials />
            <SaveMore />
            <div className="flex bg-[#04061E]  mt-56 justify-center">
                <Footer />
            </div>
        </main>
    )
};