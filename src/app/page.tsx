import Features from "@/components/globals/features";
import Hero from "@/components/globals/hero";
import { FloatingNavbar } from "@/components/globals/navbar";
import Partners from "@/components/globals/partners";
import Service from "@/components/globals/service";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#a7adec] mx-auto h-full z-10 overflow-hidden">
      <FloatingNavbar />
      <Image src='/mask.png' height={1000} className=" absolute overflow-hidden   w-full -mt-80" width={1000} alt="Background mask for zapllo automation" />
      <Hero />
      <section>
        <Partners />
      </section>
      <section className="justify-center bg-[#05071E] flex">
        <Features />
      </section>
      <div className="">
        <Service />
      </div>
    </main>
  );
}
