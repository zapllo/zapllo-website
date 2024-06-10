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
import Cookies from "js-cookie";
import { Toaster, toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [user, setUser] = React.useState({
        email: "",
        password: "",
    })

    const onLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);
            if (response.status === 200) {
                Cookies.set("token", response.data.token);
                router.push("/dashboard");
            }

        } catch (error: any) {
            console.log("Login failed", error.message);
            toast.error("Invalid credentials"); // Display error toast
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <div className="relative flex  bg-[#04071F]  items-center justify-center overflow-hidden rounded-lg  bg-background  md:shadow-xl">
                <div className="z-10 bg-[#04071F]">
                    <Meteors number={30} />
                </div>
                <Toaster />
                <div className="flex justify-center w-full mt-16 bg-[#] ">
                    <div className="h-full mb-8 p-8 z-20 shadow-[0_3px_10px_rgb(0,0,0,0.2)] shadow-white bg-[#13163E] rounded-xl w-1/2">
                        <div className="flex justify-center">
                            <Link href='/'>
                                <img src="/logo.png" className="h-10" />
                            </Link>
                        </div>
                        <GradientText>
                            <h1 className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent text-center font-bold text-3xl p-4">{loading ? "Processing" : "Login"}</h1>
                        </GradientText>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="username">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    placeholder="Email"
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={user.password}
                                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                                    placeholder="password"
                                />
                            </div>
                            <div className="flex justify-center">
                                <Button className="w-fit bg-transparent hover:bg-transparent" onClick={onLogin}>
                                    <ShiningButton text="Login" />
                                </Button>
                            </div>


                            <Link href="/signup" className="text-center hover:underline mt-2">Not a <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold">Zapllonian
                            </span>? Register Here</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}