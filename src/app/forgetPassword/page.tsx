'use client'

import { useState } from "react";
import axios from "axios";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const response = await axios.post("/api/forgetPassword", { email });
            setMessage(response.data.message);
        } catch (error: any) {
            setMessage(error.response.data.error || "An error occurred");
        }
    };

    return (
        <div className="   bg-[#211025] h-screen ">
            <div className="flex w-full justify-center">
                <img src="/logo.png" className="h-6 mt-12" />

            </div>
            <div className="w-full flex justify-center">
                <Card className="p-5 mt-12  h-fit  max-w-3xl w-1/2   rounded bg-transparent shadow-sm">
                    <CardTitle className="text-center font-bold text-xl">Forgot Password ?</CardTitle>
                    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <input
                                type="email"
                                id="email"
                                className="w-full bg-transparent border mt-2 p-2 "
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="bg-[#017a5b] hover:bg-[#017a5b]" type="submit">Send Password Link</Button>
                    </form>
                    {message && <p>{message}</p>}
                </Card>
               
            </div>
            <div className="flex mt-12 justify-center gap-2">
                    <Home />
                    <Link href='/'>
                        <h1 className="hover:underline cursor-pointer">Back to Home</h1>
                    </Link>
                </div>
        </div>
    );
};

export default ForgotPassword;
