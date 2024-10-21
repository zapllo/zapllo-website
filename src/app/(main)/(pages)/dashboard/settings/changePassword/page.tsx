'use client'

import { useState } from "react";
import axios from "axios";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.patch("/api/changePassword", {
                currentPassword,
                newPassword,
            });
            setMessage(response.data.message);
        } catch (error: any) {
            setMessage(error.response?.data?.error || "An error occurred");
        }
    };

    return (
        <Card className="p-6  bg-transparent m-6 s">
            <CardTitle className="text-start">Change Your Password</CardTitle>
            <form onSubmit={handleSubmit}>
                <div className="mt-4">
                    {/* <Label htmlFor="currentPassword">Current Password</Label> */}
                    <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        placeholder="Current Password"
                        className="mt-2 p-2 w-full rounded outline-none bg-transparent border"
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    {/* <Label htmlFor="newPassword">New Password</Label> */}
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        className="mt-2 p-2 w-full rounded outline-none bg-transparent border"
                        placeholder="New Password"
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <Button className="mt-4 bg-[#815BF5] hover:bg-[#815BF5]" type="submit">Change Password</Button>
                {message && <p>{message}</p>}
            </form>

        </Card>
    );
};

export default ChangePassword;
