"use client";
import React from "react";
import { FloatingNav } from "../ui/floating-navbar";
import { Home, MessageCircle, User } from "lucide-react";
import Image from "next/image";
import ShimmerButton from "../magicui/shimmer-button";
import Link from "next/link";

export function FloatingNavbar() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Templates",
      link: "/Templates",
      icon: <User className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Success Stories",
      link: "/successstories",
      icon: (
        <MessageCircle className="h-4 w-4 text-neutral-500 dark:text-white" />
      ),
    },
  ];


  return (
    <div className="fixed top-0 left-0 right-0 z-[40] opacity-95 p-4  supports-backdrop-blur:bg-transparent /60  bg-transparent /95 backdrop-blur  ">
      <FloatingNav navItems={navItems} />

    </div>
  );
}
