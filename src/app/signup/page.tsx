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


export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        whatsappNo: "",
    })


    const onSignup = async () => {
        try {
            const response = await axios.post("/api/users/signup", user);
            router.push("/login");

        } catch (error: any) {
            console.log("Signup failed", error.message);
        }
    }


    return (
        <>
            <div className="relative flex  bg-[#04071F]  items-center justify-center overflow-hidden rounded-lg  bg-background  md:shadow-xl">
                <div className="z-10 bg-[#04071F]">
                    <Meteors number={30} />

                </div>

                <div className="flex justify-center w-full  mt-16  ">
                    <div className="h-full p-8 z-20 shadow-[0_3px_10px_rgb(0,0,0,0.2)] shadow-white bg-[#13163E] rounded-xl mb-8 w-1/2">
                        <div className="flex justify-center">
                            <Link href='/'>
                                <img src="/logo.png" className="h-10" />
                            </Link>
                        </div>
                        <GradientText>
                            <h1 className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent text-center font-bold text-3xl p-4">Get Started </h1>🚀
                        </GradientText>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="whatsappNo">Whatsapp No</Label>
                                <Input
                                    id="whatsappNo"
                                    type="number"
                                    value={user.whatsappNo}
                                    onChange={(e) => setUser({ ...user, whatsappNo: e.target.value })}
                                    placeholder="Whatsapp No"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="text"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    placeholder="email"
                                />
                            </div>
                            <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    value={user.firstName}
                                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                                    placeholder="First Name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    value={user.lastName}
                                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                                    placeholder="Last Name"
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
                                <Button className="w-fit bg-transparent hover:bg-transparent" onClick={onSignup}>
                                    <ShiningButton text="Sign Up" />
                                </Button>
                            </div>


                            <Link href="/login" className="text-center hover:underline mt-2">Already a <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold">Zapllonian
                            </span>? Login Here</Link>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )

}