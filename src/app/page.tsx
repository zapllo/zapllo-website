import Automate from "@/components/globals/automate";
import Features from "@/components/globals/features";
import Hero from "@/components/globals/hero";
import { FloatingNavbar } from "@/components/globals/navbar";
import Partners from "@/components/globals/partners";
import Service from "@/components/globals/service";
import Tools from "@/components/globals/tools";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#] bg-[#05071E] mx-auto h-full z-10 overflow-hidden">
      <FloatingNavbar />
      <Image src='/mask.png' height={1000} className=" absolute overflow-hidden   w-full -mt-80" width={1000} alt="Background mask for zapllo automation" />
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
      <img src="light.png" className="-mt-36 absolute h-full w-96" />

    </main>
  );
}
