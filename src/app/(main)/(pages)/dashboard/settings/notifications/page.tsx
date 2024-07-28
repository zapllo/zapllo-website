'use client';
// In your settings component
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Settings() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [whatsappNotifications, setWhatsappNotifications] = useState(true);

    useEffect(() => {
        // Fetch the current settings
        axios.get('/api/users/me').then(response => {
            setEmailNotifications(response.data.notifications.email);
            setWhatsappNotifications(response.data.notifications.whatsapp);
        });
    }, []);

    const updateSettings = async () => {
        try {
            await axios.patch('/api/users/update-notifications', {
                email: emailNotifications,
                whatsapp: whatsappNotifications,
            });
            alert('Settings updated');
        } catch (error) {
            console.error('Failed to update settings', error);
            alert('Failed to update settings');
        }
    };

    return (
        <div className="settings-container p-6  shadow-md rounded-md">
            <h1 className="text-xl font-bold mb-4">Notification Settings</h1>
            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-white"
                    />
                    <span className="ml-2">Email Notifications</span>
                </label>
            </div>
            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={whatsappNotifications}
                        onChange={(e) => setWhatsappNotifications(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-white"
                    />
                    <span className="ml-2">WhatsApp Notifications</span>
                </label>
            </div>
            <button
                onClick={updateSettings}
                className="px-4 py-2 bg-primary text-white rounded-md  transition"
            >
                Save Settings
            </button>
        </div>
    );
}
