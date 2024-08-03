"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs2 = TabsPrimitive.Root

const TabsList2 = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-11 items-center space-x-8 justify-start -[0.5px] bg-[#2E0832] py-4 border-[#E0E0E066] w-[100%] rounded-lg text-muted-foreground",
            className
        )}
        {...props}
    />
))
TabsList2.displayName = TabsPrimitive.List.displayName

const TabsTrigger2 = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex  justify-start border-r-none whitespace-nowrap px-12 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#017A5B]  data-[state=active]:text-foreground data-[state=active]:shadow",
            className
        )}
        {...props}
    />
))
TabsTrigger2.displayName = TabsPrimitive.Trigger.displayName

const TabsContent2 = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
))
TabsContent2.displayName = TabsPrimitive.Content.displayName

export { Tabs2, TabsList2, TabsTrigger2, TabsContent2 }
