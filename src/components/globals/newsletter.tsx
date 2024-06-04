"use client";

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState('');

    const handleSubscribe = async () => {
        setSubscribed(false);
        setError('');

        try {
            const response = await fetch('/api/addSubscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error || 'Something went wrong');
                return;
            }

            setSubscribed(true);
            setEmail('');
        } catch (err) {
            setError('Something went wrong');
        }
    };

    return (
        <div>
            <div className="flex">
                <Input
                    placeholder="Enter Your Email"
                    className="mt-6 h-12 rounded-r-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                    className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] p-6  rounded-xl rounded-l-none mt-6"
                    onClick={handleSubscribe}
                >
                    Subscribe
                </Button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            {subscribed && (
                <p className="text-green-500 text-xs mt-2">Subscribed!</p>
            )}
        </div>
    );
}
