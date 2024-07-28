"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Import useSearchParams from next/navigation
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Card, CardTitle } from "@/components/ui/card";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams(); // Use useSearchParams hook

    useEffect(() => {
        const token = searchParams.get('token'); // Get the token from the query parameters
        if (token) {
            setToken(token);
        }
    }, [searchParams]);

    const onSubmit = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("/api/reset-password", { token, password });
            if (response.status === 200) {
                toast.success("Password reset successfully");
                router.push("/login");
            }
        } catch (error: any) {
            console.log("Failed to reset password", error.message);
            toast.error("Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col -mt-12 items-center justify-center min-h-screen py-2">
            <Card className="w-full max-w-md p-8 space-y-8  rounded shadow-md">
                <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                <div className="space-y-4">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                <Button onClick={onSubmit} disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </Button>
                <Toaster position="top-center" />
            </Card>
        </div>
    );
}
