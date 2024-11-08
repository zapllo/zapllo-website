'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

type TrialContextType = {
    isTrialExpired: boolean;
    setTrialExpired: (status: boolean) => void;
};

const TrialContext = createContext<TrialContextType>({
    isTrialExpired: false,
    setTrialExpired: () => { },
});

export const useTrial = () => useContext(TrialContext);

export const TrialProvider = ({ children }: { children: React.ReactNode }) => {
    const [isTrialExpired, setTrialExpired] = useState(false);

    useEffect(() => {
        const checkTrialStatus = async () => {
            try {
                const response = await axiosInstance.get('/api/organization/getById');
                const trialEnd = new Date(response.data.data.trialExpires);
                const expired = trialEnd <= new Date();
                setTrialExpired(expired);
                localStorage.setItem('isTrialExpired', expired.toString());
            } catch (error) {
                console.error("Error checking trial status", error);
            }
        };

        checkTrialStatus();
    }, []);

    return (
        <TrialContext.Provider value={{ isTrialExpired, setTrialExpired }}>
            {children}
        </TrialContext.Provider>
    );
};
