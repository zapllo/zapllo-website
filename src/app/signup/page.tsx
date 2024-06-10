"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import GradientText from "@/components/magicui/gradient";
import { Label } from "@/components/ui/label";
import { ShiningButton } from "@/components/globals/shiningbutton";
import { Button } from "@/components/ui/button";
import Meteors from "@/components/magicui/meteors";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";
import Home from "@/components/icons/home";


export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        whatsappNo: "",
    })


    const onSignup = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/api/users/signup", user);

            router.push("/login");

        } catch (error: any) {
            toast.error("Invalid credentials"); // Display error toast
            console.log("Signup failed", error.message);
        } finally {
            setLoading(false); //Stops Loading
        }
    }


    return (
        <>
            <div className="relative flex  bg-[#04071F]  items-center justify-center overflow-hidden rounded-lg  bg-background  md:shadow-xl">
                <div className="z-10 bg-[#04071F]">
                    <Meteors number={30} />
                </div>
                <Toaster />

                <div className="max-w-md w-full mt-4 z-[100] mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">


                    <div className="flex justify-center">
                        <img src='/logo.png' className="h-7 " />


                    </div>
                    <p className="text-neutral-600 text-sm font-bold text-center max-w-sm mt-2 dark:text-neutral-300">
                        Get Started
                    </p>

                    <div className="my-8" >
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                            <LabelInputContainer>
                                <Label htmlFor="firstname">First name</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    value={user.firstName}
                                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                                    placeholder="Ben"
                                />
                            </LabelInputContainer>
                            <LabelInputContainer>
                                <Label htmlFor="lastname">Last name</Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    value={user.lastName}
                                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                                    placeholder="Richards"
                                />
                            </LabelInputContainer>
                        </div>
                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="text"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                placeholder="example@gmail.com"
                            />
                        </LabelInputContainer>
                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={user.password}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </LabelInputContainer>
                        <LabelInputContainer className="mb-8">
                            <Label htmlFor="whatsappNo">Your WhatsApp Number</Label>
                            <Input
                                id="whatsappNo"
                                type="number"
                                value={user.whatsappNo}
                                onChange={(e) => setUser({ ...user, whatsappNo: e.target.value })}
                                placeholder="Whatsapp No"
                            />
                        </LabelInputContainer>

                        <button
                            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                            type="submit" onClick={onSignup} disabled={loading}
                        >
                            {loading ? "Signing up..." : "Sign up →"}
                            <BottomGradient />
                        </button>
                        <div className="p-4 flex justify-center">
                            <Link href="/login" className="text-center hover:underline mt-2">Already a <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold">Zapllonian
                            </span>? Login Here</Link>
                        </div>
                        <p className="text-xs text-center">By clicking continue, you agree to our <a href="/terms" className="underline">
                            Terms of Service
                        </a> and <a href="/privacypolicy" className="underline">
                                Privacy Policy
                            </a>.</p>
                        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

                        <div className="flex justify-center gap-2">
                            <Home selected />
                        <Link href='/'>

                            <h1 className="hover:underline cursor-pointer">Back to Home</h1>
                        </Link>
                    </div>
                    </div>
                </div>
            </div>
        </>

    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};