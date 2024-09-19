'use client';

import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import Loader from '@/components/ui/loader';
import * as Dialog from '@radix-ui/react-dialog';

import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet related components with `ssr: false`
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define interface for login entries
interface LoginEntry {
    userId: string;
    lat: number;
    lng: number;
    timestamp: string;
    action: 'login' | 'logout';
}




export default function MyAttendance() {
    const [loginEntries, setLoginEntries] = useState<LoginEntry[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [activeTab, setActiveTab] = useState('thisMonth'); // Set default to 'thisMonth'
    const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null,
    });
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

    // For Face Login Modal
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const webcamRef = React.useRef<Webcam>(null);
    // State variables for Regularization Modal
    const [isRegularizationModalOpen, setIsRegularizationModalOpen] = useState(false);
    const [regularizationDate, setRegularizationDate] = useState('');
    const [regularizationLoginTime, setRegularizationLoginTime] = useState('');
    const [regularizationLogoutTime, setRegularizationLogoutTime] = useState('');
    const [regularizationRemarks, setRegularizationRemarks] = useState('');
    const [isSubmittingRegularization, setIsSubmittingRegularization] = useState(false);

    useEffect(() => {
        // if (typeof window !== 'undefined') {
        //     // Dynamically set Leaflet icon options only after the window object is available
        //     delete (L.Icon.Default.prototype as any)._getIconUrl;
        //     L.Icon.Default.mergeOptions({
        //         iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        //         iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        //         shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        //     });
        // }

        const fetchLoginEntriesAndStatus = async () => {
            const resEntries = await fetch('/api/loginEntries');
            const dataEntries = await resEntries.json();
            setLoginEntries(dataEntries.entries);

            const resStatus = await fetch('/api/check-login-status');
            const dataStatus = await resStatus.json();

            if (dataStatus.success) {
                setIsLoggedIn(dataStatus.isLoggedIn);
            }
        };

        fetchLoginEntriesAndStatus();
    }, [isLoggedIn]);

    // Open modal for face login
    const handleLoginLogout = () => {
        setIsModalOpen(true);
    };

    // Capture image and location
    const captureImageAndLocation = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            });
        }
    };

    // Submit face login/logout
    const handleSubmitLogin = async () => {
        if (!capturedImage || !location) {
            alert('Please capture an image and allow location access.');
            return;
        }
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('files', dataURLtoBlob(capturedImage, 'captured_image.jpg'));

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.fileUrls[0];

            if (!uploadResponse.ok) {
                throw new Error('Image upload failed.');
            }

            const action = isLoggedIn ? 'logout' : 'login'; // Determine login or logout action

            const loginResponse = await fetch('/api/face-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrl,
                    lat: location.lat,
                    lng: location.lng,
                    action, // Send the action (login or logout)
                }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok && loginData.success) {
                setIsLoggedIn(action === 'login');
                setIsModalOpen(false); // Close the modal on successful login/logout
            } else {
                throw new Error(loginData.error || 'Face recognition failed.');
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Utility function to convert base64 to Blob
    const dataURLtoBlob = (dataurl: string, filename: string) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([new Blob([u8arr], { type: mime })], filename);
    };

    // Helper functions to filter entries by date range
    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const isWithinDateRange = (date: Date, startDate: Date, endDate: Date) => {
        return date >= startDate && date <= endDate;
    };

    const isWithinLastNDays = (date: Date, days: number) => {
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - days);
        return date >= pastDate && date <= today;
    };

    const filterLastTwoDaysEntries = () => {
        const today = new Date();
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(today.getDate() - 2);

        return loginEntries.filter((entry) => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= twoDaysAgo && entryDate <= today;
        });
    };

    // Filter entries based on active tab
    const filterEntriesByTab = () => {
        const today = new Date();
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month

        switch (activeTab) {
            case 'today':
                return loginEntries.filter((entry) => isSameDay(new Date(entry.timestamp), today));
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return loginEntries.filter((entry) => isSameDay(new Date(entry.timestamp), yesterday));
            case 'thisWeek':
                const thisWeekStart = new Date(today);
                thisWeekStart.setDate(today.getDate() - today.getDay());
                return loginEntries.filter((entry) => isWithinDateRange(new Date(entry.timestamp), thisWeekStart, today));
            case 'lastWeek':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                return loginEntries.filter((entry) => isWithinDateRange(new Date(entry.timestamp), lastWeekStart, lastWeekEnd));
            case 'thisMonth':
                return loginEntries.filter((entry) => isWithinDateRange(new Date(entry.timestamp), thisMonthStart, today));
            case 'lastMonth':
                return loginEntries.filter((entry) => isWithinDateRange(new Date(entry.timestamp), lastMonthStart, lastMonthEnd));
            case 'allTime':
                return loginEntries;
            case 'custom':
                return loginEntries.filter((entry) =>
                    customDateRange.start && customDateRange.end
                        ? isWithinDateRange(new Date(entry.timestamp), customDateRange.start, customDateRange.end)
                        : true
                );
            default:
                return loginEntries;
        }
    };

    // Open map modal to show coordinates on Leaflet map
    const handleViewMap = (lat: number, lng: number) => {
        setMapCoords({ lat, lng });
        setMapModalOpen(true);
    };

    // Open custom date range modal
    const openCustomModal = () => {
        setIsCustomModalOpen(true);
    };

    // Handle custom date range submit
    const handleCustomDateSubmit = (start: Date, end: Date) => {
        setCustomDateRange({ start, end });
        setIsCustomModalOpen(false);
        setActiveTab('custom');
    };


    // Handle Regularization Form Submission
    const handleSubmitRegularization = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!regularizationDate || !regularizationLoginTime || !regularizationLogoutTime || !regularizationRemarks) {
            alert('Please fill in all fields.');
            return;
        }

        setIsSubmittingRegularization(true);

        try {
            const response = await fetch('/api/regularize', {
                method: 'POST',
                body: JSON.stringify({
                    date: regularizationDate,
                    loginTime: regularizationLoginTime,
                    logoutTime: regularizationLogoutTime,
                    remarks: regularizationRemarks,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Regularization request submitted successfully.');
                // Refresh login entries
                const resEntries = await fetch('/api/loginEntries', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                const dataEntries = await resEntries.json();
                setLoginEntries(dataEntries.entries);

                // Reset form fields
                setRegularizationDate('');
                setRegularizationLoginTime('');
                setRegularizationLogoutTime('');
                setRegularizationRemarks('');
                setIsRegularizationModalOpen(false);
            } else {
                throw new Error(data.message || 'Failed to submit regularization request.');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmittingRegularization(false);
        }
    };

    return (
        <div className="container  rounded-lg p-4 shadow-lg">
            {/* Login/Logout Button */}
            <div className="login-section flex justify-center mb-6">
                <button
                    onClick={handleLoginLogout}
                    className={`bg-${isLoggedIn ? 'red' : 'green'}-500 text-white py-2 px-6 rounded-lg font-semibold`}
                >
                    {isLoggedIn ? 'Logout' : 'Login'}
                </button>
            </div>
            {/* Apply Regularization Button */}
            <div className="apply-regularization-section flex justify-center mb-6">
                <button
                    onClick={() => setIsRegularizationModalOpen(true)}
                    className="bg-blue-500 text-white py-2 px-6 rounded-lg font-semibold"
                >
                    Apply Regularization
                </button>
            </div>
            {/* Last Two Days Entries */}
            <div className="last-two-days-entries border p-4 w-full flex  mb-6">
                {filterLastTwoDaysEntries().length === 0 ? (
                    <p className="text-center text-gray-600">No entries for the last 2 days!</p>
                ) : (
                    <div className="space-y-4 w-full mx-12">
                        {filterLastTwoDaysEntries().map((entry: LoginEntry, index: number) => {
                            const date = new Date(entry.timestamp);
                            const formattedDate = date.toLocaleDateString(); // Get the date string
                            const formattedTime = date.toLocaleTimeString(); // Get the time string

                            return (
                                <div key={index} className="flex gap-4 justify-around w-full">
                                    <div>
                                        <h1>{formattedDate}</h1> {/* Displaying the date */}
                                    </div>
                                    <div>
                                        <h2>{formattedTime}</h2> {/* Displaying the time */}
                                    </div>
                                    <div className={`p-2 text-xs border rounded text-white ${entry.action === 'login' ? 'bg-green-600' : 'bg-red-600'}`}>
                                        <h1>
                                            {entry.action.toUpperCase()}
                                        </h1>
                                    </div>

                                    <div>
                                        <button onClick={() => handleViewMap(entry.lat, entry.lng)} className="underline text-gray-500 ml-2">
                                            <MapPin />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                )}
            </div>

            {/* Tabs for filtering entries */}
            <div className="tabs mb-6 flex flex-wrap justify-center space-x-2">
                <button onClick={() => setActiveTab('today')} className={`px-4 h-fit py-2 text-xs rounded ${activeTab === 'today' ? 'bg-[#7c3987]' : 'bg-transparent border'}`}>Today</button>
                <button onClick={() => setActiveTab('yesterday')} className={`px-4 h-fit py-2 text-xs rounded ${activeTab === 'yesterday' ? 'bg-[#7c3987]' : 'bg-transparent border'}`}>Yesterday</button>
                <button onClick={() => setActiveTab('thisWeek')} className={`px-4 py-2 h-fit text-xs rounded ${activeTab === 'thisWeek' ? 'bg-[#7c3987]' : 'bg-transparent border'}`}>This Week</button>
                <button onClick={() => setActiveTab('lastWeek')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'lastWeek' ? 'bg-[#7c3987]' : 'bg-transparent border'}`}>Last Week</button>
                <button onClick={() => setActiveTab('thisMonth')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'thisMonth' ? 'bg-[#7c3987]' : 'bg-transparent border'}`}>This Month</button>
                <button onClick={() => setActiveTab('lastMonth')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'lastMonth' ? 'bg-[#7c3987]' : 'bg-transparent border'}`}>Last Month</button>
                <button onClick={() => setActiveTab('allTime')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'allTime' ? 'bg-[#7c3987]' : 'bg-transparent border'}`}>All Time</button>
                <button onClick={openCustomModal} className="px-4 py-2 rounded bg-transparent border text-xs">Custom</button>
            </div>

            {/* Display login/logout entries */}
            <div className="entries-list mb-6">
                {filterEntriesByTab()?.length === 0 ? (
                    <p className="text-center text-gray-600">No Entries for the selected time frame!</p>
                ) : (
                    <ul className="space-y-4">
                        {filterEntriesByTab().map((entry, index) => (
                            <li key={index} className="flex justify-between items-center  p-4 rounded-lg shadow-md">
                                <span>{new Date(entry.timestamp).toLocaleString()} - <strong>{entry?.action?.toUpperCase()}</strong></span>
                                <button onClick={() => handleViewMap(entry.lat, entry.lng)} className="underline text-blue-500 ml-2">
                                    <MapPin />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Radix UI Dialog for Face Login */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Trigger asChild></Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                    <Dialog.Content className="fixed inset-0 flex justify-center items-center">
                        <div className="bg-[#1A1C20] p-6 rounded-lg max-w-md w-full">
                            <h3 className="text-lg mb-4">{isLoggedIn ? 'Log Out' : 'Log In'}</h3>

                            {/* Webcam for Face Login */}
                            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-auto rounded mb-4" />

                            {/* Capture Image and Location Button */}
                            <button onClick={captureImageAndLocation} className="bg-blue-500 text-white py-2 px-4 rounded w-full mb-4">Capture Image & Location</button>

                            {/* Display Latitude and Longitude */}
                            <p>Latitude: {location?.lat}</p>
                            <p>Longitude: {location?.lng}</p>

                            {/* Submit Button */}
                            {isLoading ? <Loader /> : <button onClick={handleSubmitLogin} className="bg-green-500 text-white py-2 px-4 rounded w-full">{isLoggedIn ? 'Log Out' : 'Log In'}</button>}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Map Modal */}
            <Dialog.Root open={mapModalOpen} onOpenChange={setMapModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                    <Dialog.Content className="fixed inset-0 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg max-w-md w-full">
                            {mapCoords && (
                                <MapContainer center={[mapCoords.lat, mapCoords.lng]} zoom={13} scrollWheelZoom={false} style={{ height: '400px', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                    <Marker position={[mapCoords.lat, mapCoords.lng]}></Marker>
                                </MapContainer>
                            )}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Custom Date Range Modal */}
            {/* Custom Date Range Modal */}
            <Dialog.Root open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                    <Dialog.Content className="fixed inset-0 flex justify-center items-center">
                        <div className="bg-[#1A1C20] p-6 rounded-lg max-w-md w-full">
                            <h3 className="text-lg mb-4 text-white">Select Custom Date Range</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const start = new Date(form.start.value);
                                    const end = new Date(form.end.value);
                                    handleCustomDateSubmit(start, end);
                                }}
                                className="space-y-4"
                            >
                                {/* Start Date Input */}
                                <div>
                                    <label htmlFor="start" className="block text-sm font-medium text-gray-200">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="start"
                                        name="start"
                                        required
                                        className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white"
                                    />
                                </div>

                                {/* End Date Input */}
                                <div>
                                    <label htmlFor="end" className="block text-sm font-medium text-gray-200">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="end"
                                        name="end"
                                        required
                                        className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white py-2 px-4 rounded w-full"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            {/* Regularization Modal */}
            <Dialog.Root
                open={isRegularizationModalOpen}
                onOpenChange={setIsRegularizationModalOpen}
            >
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                    <Dialog.Content className="fixed inset-0 flex justify-center items-center p-4">
                        <div className="bg-[#1A1C20] p-6 rounded-lg max-w-md w-full">
                            <h3 className="text-lg mb-4 text-white">Apply Regularization</h3>
                            <form onSubmit={handleSubmitRegularization} className="space-y-4">
                                {/* Date Input */}
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-200">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        value={regularizationDate}
                                        onChange={(e) => setRegularizationDate(e.target.value)}
                                        required
                                        className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white"
                                    />
                                </div>

                                {/* Login Time Input */}
                                <div>
                                    <label htmlFor="loginTime" className="block text-sm font-medium text-gray-200">
                                        Login Time
                                    </label>
                                    <input
                                        type="time"
                                        id="loginTime"
                                        value={regularizationLoginTime}
                                        onChange={(e) => setRegularizationLoginTime(e.target.value)}
                                        required
                                        className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white"
                                    />
                                </div>

                                {/* Logout Time Input */}
                                <div>
                                    <label htmlFor="logoutTime" className="block text-sm font-medium text-gray-200">
                                        Logout Time
                                    </label>
                                    <input
                                        type="time"
                                        id="logoutTime"
                                        value={regularizationLogoutTime}
                                        onChange={(e) => setRegularizationLogoutTime(e.target.value)}
                                        required
                                        className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white"
                                    />
                                </div>

                                {/* Remarks Input */}
                                <div>
                                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-200">
                                        Remarks
                                    </label>
                                    <textarea
                                        id="remarks"
                                        value={regularizationRemarks}
                                        onChange={(e) => setRegularizationRemarks(e.target.value)}
                                        required
                                        className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white"
                                        rows={3}
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <div>
                                    {isSubmittingRegularization ? (
                                        <Loader />
                                    ) : (
                                        <button
                                            type="submit"
                                            className="bg-green-500 text-white py-2 px-4 rounded w-full"
                                        >
                                            Submit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
