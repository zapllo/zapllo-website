"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "./infinite-moving-cards";


export const clients = [...new Array(10)].map((client, index) => ({
  href: `/${index + 1}.png`,
}))

export function InfiniteMovingCardsDemo() {
  return (
    <div className=" rounded-md flex flex-col antialiased  dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards
        items={clients}
        direction="right"
        speed="slow"
      />
    </div>
  );
}

