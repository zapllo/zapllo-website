"use client"

// Layout.tsx
import { useEffect, useState } from "react";
import { MultiStepLoader as Loader } from "../ui/loader";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingState {
    text: string;
}

interface LayoutProps {
    children: React.ReactNode;
}

const loadingStates: LoadingState[] = [
    { text: "Loading..." },
    { text: "Upgrading your experience..." },
    { text: "Maximizing Productivity..." },
    // Add more loading states as needed
];

const LoaderLayout: React.FC<LayoutProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setLoading(true); // Set loading to true on initial render

        // Simulate a delay to demonstrate the loading state
        const timeout = setTimeout(() => {
            setLoading(false); // Set loading to false after the delay
        }, 2000);

        return () => clearTimeout(timeout); // Cleanup the timeout on component unmount
    }, [pathname, searchParams]);

    return (
        <div>
            <Loader loadingStates={loadingStates} loading={loading} />
            {children}
        </div>
    );
};

export default LoaderLayout;
