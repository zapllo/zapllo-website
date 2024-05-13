import Features from "@/components/globals/features";
import Hero from "@/components/globals/hero";
import Partners from "@/components/globals/partners";
import Service from "@/components/globals/service";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#05071E] mx-auto h-full overflow-hidden">
      <Image src='/mask.png' height={1000} className=" absolute overflow-hidden  w-full -mt-80" width={1000} alt="Background mask for zapllo automation" />
      <Hero />
      <section>
        <Partners />
      </section>
      <section className="justify-center bg-[#05071E] flex">
        <Features />
      </section>
      <div className="mt-12">
        <Service />
      </div>
    </main>
  );
}
