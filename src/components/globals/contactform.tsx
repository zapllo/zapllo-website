"use client";

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import TextShimmer from "@/components/magicui/animated-shiny-text";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";

export default function ContactForm() {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [message, setMessage] = useState("");
    const [mobNo, setMobNo] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState("");

    const handleSubscribe = async (event: any) => {
        event.preventDefault();
        setSubscribed(false);
        setError("");
        if (!email || !firstName || !lastName || !mobNo || !message) {
            setError("All fields are required.");
            return;
        }
        try {
            const response = await fetch("/api/leads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, firstName, lastName, mobNo, message }),
            });
            if (response.ok) {
                toast.success("Message sent successfully!");
                setSubscribed(true);
                setEmail("");
                setFirstName("");
                setLastName("");
                setMobNo("");
                setMessage("");
            } else {
                const data = await response.json();
                setError(data.error || "Something went wrong");
            }
        } catch (err) {
            setError("Something went wrong");
        }
    };

    return (
        <form className="p-8" onSubmit={handleSubscribe}>
            <Toaster />
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <Label>First Name</Label>
                    <input
                        placeholder="First Name"
                        className="bg-transparent border rounded-md p-2"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className="space-y-4">
                    <Label>Last Name</Label>
                    <input
                        placeholder="Last Name"
                        className="bg-transparent border rounded-md p-2"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div className="space-y-4">
                    <Label>Email</Label>
                    <input
                        placeholder="Email"
                        className="bg-transparent border rounded-md p-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-4">
                    <Label>WhatsApp Number</Label>
                    <input
                        placeholder="WhatsApp Number"
                        className="bg-transparent border  rounded-md p-2"
                        type="text"
                        value={mobNo}
                        onChange={(e) => setMobNo(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid w-full gap-1.5 mt-4 space-y-4">
                <Label htmlFor="message">Your message</Label>
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here."
                    className="h-32"
                    id="message"
                />
            </div>
            <div className="md:flex md:justify-between mt-8">
                <Button className="bg-transparent hover:bg-transparent -ml-3" type="submit" disabled={subscribed}>
                    <div className="z-10 flex hover:-mt-2 transition-all ease-in items-center justify-center">
                        <div
                            className={cn(
                                "group rounded-full w-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:hover:text-white dark:bg-gradient-to-r from-[#A587FF] to-[#5E29FF] dark:hover:bg-blue-800",
                            )}
                        >
                            <TextShimmer className="inline-flex text-[18px] w-full h-10 items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-900 hover:dark:text-white">
                                <span className="flex mt-auto font-medium gap-3">
                                    <img src="chat.gif" className="h-5" alt="Chat" /> Let&apos;s Talk
                                </span>
                            </TextShimmer>
                        </div>
                    </div>
                </Button>
                <div>
                    <p className="flex gap-2 md:max-w-[300px] md:mt-0 mt-4 text-[#676B93] text-xs">
                        <InfoCircledIcon className="scale-150" /> All the fields are required. By sending the form you
                        agree to the Terms & Conditions and Privacy Policy.
                    </p>
                </div>
            </div>
        </form>
    );
}
