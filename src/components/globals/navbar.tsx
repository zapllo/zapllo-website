"use client";
import React from "react";
import { FloatingNav } from "../ui/floating-navbar";
import { Home, MessageCircle, User } from "lucide-react";
import Image from "next/image";
import ShimmerButton from "../magicui/shimmer-button";
import Link from "next/link";

export function FloatingNavbar() {

  return (
    <div className="fixed top-0 left-0 right-0 z-[40] opacity-95 p-4  supports-backdrop-blur:bg-transparent /60  bg-transparent /95 backdrop-blur  ">
      {/* <FloatingNav navItems={navItems} /> */}
      <div className="flex justify-between">
        <Image src='/logo.png' width={100} height={100} alt="Zapllo Logo" className="z-[100] p-2 w-fit h-fit " />
        {/* <Image src='/logo.png' height={100} width={100} alt="Zapllo Logo" /> */}
        <nav className='absolute left-[50%] top-[50%] transform translate-x-[-50%] dark:text-white text-white translate-y-[-50%] hidden md:block'>
        <ul className="flex items-center gap-4 list-none">
          <li className="">
            <Link href="#" className="font-bold">Home</Link>
          </li>
          <li>
            <Link href="#" className="font-bold">Templates</Link>
          </li>
          <li>
            <Link href="#" className="font-bold">Success Stories</Link>
          </li>
          <li>
            <Link href="#" className="font-bold">Contact</Link>
          </li>
        </ul>
      </nav>
        <aside className="flex items-center gap-4 ">
          <Link
            href="/dashboard"
            className="relative inline-flex h-8 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3  text-sm font-medium text-white backdrop-blur-3xl">
              {/** WIP : Wire up User */}
              Get Started
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
