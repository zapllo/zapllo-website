'use client'

import { useState } from "react";
import axios from "axios";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
        <div className=" flex justify-center">
            <Card className="p-5 mt-12 max-w-3xl w-full shadow-white shadow-sm">
                <CardTitle className="text-center font-bold text-xl">Forgot Password ?</CardTitle>
                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit">Send Password Link</Button>
                </form>
                {message && <p>{message}</p>}
            </Card>
        </div>
    );
};

export default ForgotPassword;
