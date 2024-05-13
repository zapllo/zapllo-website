"use client";
import React from "react";
import { FloatingNav } from "../ui/floating-navbar";
import { Home, MessageCircle, User } from "lucide-react";
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
    <div className="relative   w-full">
      <FloatingNav navItems={navItems} />
      
    </div>
  );
}
