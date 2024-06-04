import Footer from "@/components/globals/Footer";
import Arrow from "@/components/globals/arrow";
import Automate from "@/components/globals/automate";
import Faq from "@/components/globals/faq";
import Features from "@/components/globals/features";
import Grow from "@/components/globals/grow";
import GrowSubs from "@/components/globals/growsubs";
import Hero from "@/components/globals/hero";
import { InfiniteMoving } from "@/components/globals/infinite-moving";
import LoaderLayout from "@/components/globals/multi-step-loader";
import { FloatingNavbar } from "@/components/globals/navbar";
import OfficialPartners from "@/components/globals/officialpartners";
import OurTeam from "@/components/globals/ourteam";
import Partners from "@/components/globals/partners";
import Service from "@/components/globals/service";
import TeamBubble from "@/components/globals/teambubble";
import Testimonials from "@/components/globals/testimonials";
import Testimonials2 from "@/components/globals/testimonials2";
import Tools from "@/components/globals/tools";
import Image from "next/image";

export default function Home() {
  return (
    // <LoaderLayout>
      <main className="bg-[#] bg-[#05071E] mx-auto h-full z-10 overflow-hidden">
        <FloatingNavbar />
        <Image src='/mask.png' height={1000} className=" absolute overflow-hidden w-full " width={1000} alt="Background mask for zapllo automation" />
        <Hero />
        <section>
          <Partners />
        </section>
        <section className="justify-center bg-[#05071E]  flex">
          <Features />
        </section>
        <div className="mt-12 bg-[#05071E]">
          <Service />
        </div>
        <div className="mt-4  flex justify-center  bg-[#05071E]">
          <Automate />
        </div>
        <div className="justify-center mt-4  flex bg-[#05071E]">
          <Tools />
        </div>
        <img src="light.png" className="-mt-72 h-96 w-[50%]" />
        <div className="justify-center mt-64 md:mt-0 flex bg-[#04061E]">
          <Grow />
        </div>
        <div className="mt-24 justify-center flex bg-[#0A0D28] ">
          <div className="max-w-[1100px] w-full bg-[#0A0D28]">
            <h1 className="mx-4 md:mx-0 font-bold pt-12 text-start text-4xl">
              The Power of <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent">AI</span>. The <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent"> Care of Humans</span>.
            </h1>
            <p className="text-sm mt-8 mx-4 md:mx-0 text-gray-200">Empowering brands with AI precision, enhanced by human insight, ensuring exceptional quality in every newsletter.</p>
          </div>
        </div>
        <div className="justify-center   pt-12  md:flex bg-[#0A0D28]">
          <Arrow />
        </div>
        <div className="justify-center mt-24  flex bg-[#04061E]">
          <OfficialPartners />
        </div>
        <div className="justify-center mt-16  flex bg-[#04061E]">
          <GrowSubs />
        </div>
        <div className="mt-12 mb-12">
          <InfiniteMoving
            direction="right"
            speed="slow"
          />
        </div>
        <div className="justify-center mt-32  flex b  ">
          <Testimonials />
        </div>
        <div className="justify-center mt-32  flex bg-[#04061E]  ">
          <Testimonials2 />
        </div>
        <div className="justify-center  mt-4  flex bg-[#04061E]  ">
          <Faq />
        </div>

        <div className="justify-center mt-32   flex b  ">
          <Testimonials />
        </div>
        <div className="justify-center mt-20  flex bg-[#04061E]  ">
          {/* <OurTeam /> */}
          <TeamBubble />
        </div>
        <div className="flex bg-[#04061E] mt-8 justify-center">
          <Footer />
        </div>
      </main>
    // </LoaderLayout>
  );
}
