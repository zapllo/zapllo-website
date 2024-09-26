'use client';

import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import Loader from '@/components/ui/loader';
import * as Dialog from '@radix-ui/react-dialog';

import { Calendar, Camera, Clock, MapPin, MapPinIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import format from 'date-fns';

// Dynamically import Leaflet related components with `ssr: false`
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import RegisterFace from '../settings/register-faces/page';
import { toast, Toaster } from 'sonner';
import RegularizationDetails from '@/components/sheets/regularizationDetails';
import CustomDatePicker from '@/components/globals/date-picker';
import { Button } from '@/components/ui/button';

// Define interface for login entries
interface LoginEntry {
    _id: string;
    userId: {
        firstName: string;
        lastName: string;
        reportingManager: {
            firstName: string;
            lastName: string;
        };
    };
    lat: number;
    lng: number;
    timestamp: string;
    action: 'login' | 'logout' | 'regularization';
    approvalStatus?: 'Pending' | 'Approved' | 'Rejected'; // Add the approvalStatus field
    loginTime: string;
    logoutTime: string;
    remarks: string;
    notes?: string;
}


// Helper function to group entries by day
const groupEntriesByDay = (entries: LoginEntry[]) => {
    return entries.reduce((acc: { [date: string]: LoginEntry[] }, entry) => {
        const date = new Date(entry.timestamp).toLocaleDateString(); // Group by date
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(entry);
        return acc;
    }, {});
};


export default function MyAttendance() {
    const [loginEntries, setLoginEntries] = useState<LoginEntry[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [activeTab, setActiveTab] = useState('thisMonth'); // Set default to 'thisMonth'
    const [activeAttendanceTab, setActiveAttendanceTab] = useState('dailyReport');
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
    const [hasRegisteredFaces, setHasRegisteredFaces] = useState(false);
    const [isRegisterFaceModalOpen, setIsRegisterFaceModalOpen] = useState(false); // Modal for Registering Faces
    const [selectedImages, setSelectedImages] = useState<File[]>([]); // For image selection
    const [expandedDays, setExpandedDays] = useState<{ [date: string]: boolean }>({});
    const [displayLoader, setDisplayLoader] = useState(false);
    const [isDateSelected, setIsDateSelected] = useState<boolean>(false); // Track whether the user manually selects a date
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         // Dynamically set Leaflet icon options only after the window object is available
    //         delete (L.Icon.Default.prototype as any)._getIconUrl;
    //         L.Icon.Default.mergeOptions({
    //             iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    //             iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    //             shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    //         });
    //     }
    // }, [])


    useEffect(() => {
        const fetchLoginStatus = async () => {
            try {
                setDisplayLoader(true)
                const res = await fetch('/api/check-login-status');
                const data = await res.json();

                if (data.success) {
                    setIsLoggedIn(data.isLoggedIn);
                    setHasRegisteredFaces(data.hasRegisteredFaces);
                } else {
                    alert(data.error || 'Failed to fetch login status.');
                }
            } catch (error) {
                console.error('Error fetching login status:', error);
            } finally {
                setDisplayLoader(false)
            }
        };

        fetchLoginStatus();
    }, []);

    useEffect(() => {
        const fetchLoginEntriesAndStatus = async () => {
            try {
                setDisplayLoader(true)
                // Fetch login entries
                const resEntries = await fetch('/api/loginEntries');
                const dataEntries = await resEntries.json();
                setLoginEntries(dataEntries.entries);

                // Check if the user's face registration is approved
                const resFaceStatus = await fetch('/api/check-face-registration-status');
                const dataFaceStatus = await resFaceStatus.json();

                if (dataFaceStatus.success) {
                    setHasRegisteredFaces(dataFaceStatus.isFaceRegistered);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setDisplayLoader(false)
            }
        };

        fetchLoginEntriesAndStatus();
    }, [isLoggedIn]);

    const handleFaceRegistrationSubmit = async () => {
        if (selectedImages.length !== 3) {
            alert('Please upload exactly 3 images.');
            return;
        }

        try {
            // Upload the images first
            const formData = new FormData();
            selectedImages.forEach((file) => formData.append('files', file));

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) {
                throw new Error('Image upload failed.');
            }

            // Send a request to save the face registration request with pending status
            const faceRegistrationResponse = await fetch('/api/face-registration-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrls: uploadData.fileUrls, // URLs from the image upload
                }),
            });

            const faceRegistrationData = await faceRegistrationResponse.json();
            if (faceRegistrationResponse.ok && faceRegistrationData.success) {
                alert('Face registration request submitted successfully and is pending approval.');
                setIsRegisterFaceModalOpen(false);
                setSelectedImages([]); // Reset images
            } else {
                throw new Error('Face registration request submission failed.');
            }
        } catch (error: any) {
            alert(error.message);
        }
    };


    // Open modal for face login
    const handleLoginLogout = () => {
        setIsModalOpen(true);
        setCapturedImage(null);
        setLocation(null);
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
    // const handleSubmitLogin = async () => {
    //     if (!capturedImage || !location) {
    //         alert('Please capture an image and allow location access.');
    //         return;
    //     }
    //     setIsLoading(true);

    //     try {
    //         const formData = new FormData();
    //         formData.append('files', dataURLtoBlob(capturedImage, 'captured_image.jpg'));

    //         const uploadResponse = await fetch('/api/upload', {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         const uploadData = await uploadResponse.json();
    //         const imageUrl = uploadData.fileUrls[0];

    //         if (!uploadResponse.ok) {
    //             throw new Error('Image upload failed.');
    //         }

    //         const action = isLoggedIn ? 'logout' : 'login'; // Determine login or logout action

    //         const loginResponse = await fetch('/api/face-login', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 imageUrl,
    //                 lat: location.lat,
    //                 lng: location.lng,
    //                 action, // Send the action (login or logout)
    //             }),
    //         });

    //         const loginData = await loginResponse.json();

    //         if (loginResponse.ok && loginData.success) {
    //             setIsLoggedIn(action === 'login');
    //             setIsModalOpen(false); // Close the modal on successful login/logout
    //         } else {
    //             throw new Error(loginData.error || 'Face recognition failed.');
    //         }
    //     } catch (err: any) {
    //         alert(err.message);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const selectedFiles = Array.from(files);
            setSelectedImages(selectedFiles.slice(0, 3)); // Limit to 3 images
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


        return loginEntries?.filter((entry) => {
            const entryDate = new Date(entry.timestamp);
            return entryDate <= today && entryDate >= today;
        });
    };

    // Filter entries based on active tab

    const filterEntriesByTab = () => {
        const today = new Date();
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        const normalizeDate = (date: Date) => {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        };

        const todayNormalized = normalizeDate(today);

        switch (activeTab) {
            case 'today':
                return loginEntries?.filter((entry) => {
                    const entryDate = normalizeDate(new Date(entry.timestamp));
                    return entryDate.getTime() === todayNormalized.getTime();
                });
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                const yesterdayNormalized = normalizeDate(yesterday);
                return loginEntries?.filter((entry) => {
                    const entryDate = normalizeDate(new Date(entry.timestamp));
                    return entryDate.getTime() === yesterdayNormalized.getTime();
                });
            case 'thisWeek':
                const thisWeekStart = new Date(today);
                thisWeekStart.setDate(today.getDate() - today.getDay());
                return loginEntries?.filter((entry) => {
                    const entryDate = normalizeDate(new Date(entry.timestamp));
                    return entryDate >= normalizeDate(thisWeekStart) && entryDate <= todayNormalized;
                });
            case 'lastWeek':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                return loginEntries?.filter((entry) => {
                    const entryDate = normalizeDate(new Date(entry.timestamp));
                    return entryDate >= normalizeDate(lastWeekStart) && entryDate <= normalizeDate(lastWeekEnd);
                });
            case 'thisMonth':
                return loginEntries?.filter((entry) => {
                    const entryDate = normalizeDate(new Date(entry.timestamp));
                    return entryDate >= normalizeDate(thisMonthStart) && entryDate <= todayNormalized;
                });
            case 'lastMonth':
                return loginEntries?.filter((entry) => {
                    const entryDate = normalizeDate(new Date(entry.timestamp));
                    return entryDate >= normalizeDate(lastMonthStart) && entryDate <= normalizeDate(lastMonthEnd);
                });
            case 'allTime':
                return loginEntries;
            case 'custom':
                if (customDateRange.start && customDateRange.end) {
                    const startNormalized = normalizeDate(customDateRange.start);
                    const endNormalized = normalizeDate(customDateRange.end);
                    return loginEntries?.filter((entry) => {
                        const entryDate = normalizeDate(new Date(entry.timestamp));
                        return entryDate >= startNormalized && entryDate <= endNormalized;
                    });
                } else {
                    return loginEntries;
                }
            default:
                return loginEntries;
        }
    };


    const filteredEntries = filterEntriesByTab();

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
            toast.error('Please fill in all fields.');
            return;
        }

        setIsSubmittingRegularization(true);

        try {
            setAttendanceLoading(true)
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
                toast.success('Regularization request submitted successfully.');
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
                setAttendanceLoading(false)

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
            toast.error(error.message);
        } finally {
            setIsSubmittingRegularization(false);
        }
    };

    console.log(loginEntries, 'login entries')

    const handleRegisterFaces = () => {
        setIsRegisterFaceModalOpen(true);
    };
    // Fetch the user's location when the component mounts
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Error fetching location:', error);
                    toast.error('Unable to fetch location. Please allow location access.');
                }
            );
        }
    }, []);


    const handleModalChange = (isOpen: boolean) => {
        if (isOpen) {
            setLocation(null); // Reset the location initially
            // Set loading state while fetching the location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    (error) => {
                        console.error('Error fetching location:', error);
                        toast.error('Unable to fetch location. Please allow location access.');
                    }
                );
            }
        } else {
            setCapturedImage(null);
            setLocation(null);
        }
        setIsModalOpen(isOpen);
    };



    const captureImageAndSubmitLogin = async () => {
        // Capture image
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
        }

        if (!imageSrc || !location) {
            toast.error('Please capture an image and ensure location is available.');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('files', dataURLtoBlob(imageSrc, 'captured_image.jpg'));

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
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };



    const filterDailyReportEntries = (entries: LoginEntry[]) => {
        return entries.filter((entry) => {
            if (entry.action === 'regularization' && entry.approvalStatus !== 'Approved') {
                return false;
            }
            return true;
        });
    };

    const filterRegularizationEntries = (entries: LoginEntry[]) => {
        return entries.filter((entry) => entry.action === 'regularization');
    };

    function formatTimeToAMPM(timeString: string): string {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    const [selectedRegularization, setSelectedRegularization] = useState<LoginEntry | null>(null);

    const handleRegularizationClick = (regularization: LoginEntry) => {
        setSelectedRegularization(regularization);
    };

    const handleSheetClose = () => {
        setSelectedRegularization(null);
    };

    const renderRegularizationEntries = () => {
        const regularizationEntries = filterRegularizationEntries(filteredEntries);

        return (
            <>
                {regularizationEntries.length === 0 ? (
                    <p className="text-center text-gray-600">No Regularization Entries found!</p>
                ) : (
                    <ul className="space-y-4">
                        {regularizationEntries.map((entry, index) => (
                            <li key={index} onClick={() => handleRegularizationClick(entry)} className="flex cursor-pointer border text-xs justify-between items-center px-4 py-2 rounded shadow-md">
                                {entry.userId && (
                                    <div className="flex gap-2 justify-start">
                                        <div className="h-6 w-6 rounded-full bg-[#75517b]">
                                            <h1 className="text-center uppercase text-xs mt-1">
                                                {entry.userId.firstName[0]}{entry.userId.lastName[0]}
                                            </h1>
                                        </div>
                                        <h1 id="userName" className="col-span-3 text-sm">{`${entry.userId.firstName} ${entry.userId.lastName}`}</h1>
                                    </div>
                                )}
                                <span>
                                    {`Login: ${formatTimeToAMPM(entry.loginTime)} - Logout: ${formatTimeToAMPM(entry.logoutTime)}`}
                                </span>

                                {/* Display approvalStatus */}
                                <span className={
                                    entry.approvalStatus === 'Approved'
                                        ? 'bg-[#017a5b] px-2 py-1 rounded-xl'
                                        : entry.approvalStatus === 'Rejected'
                                            ? 'bg-red-600'
                                            : 'bg-orange-800 px-2 py-1 rounded-xl'
                                }>
                                    {/* {`Approval Status: `} */}
                                    <strong>
                                        {entry.approvalStatus}
                                    </strong>
                                </span>

                                {/* If lat and lng are present, render the map icon */}
                                {entry.lat && entry.lng && (
                                    <button onClick={() => handleViewMap(entry.lat, entry.lng)} className="underline text-blue-500 ml-2">
                                        <MapPin />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {selectedRegularization && (
                    <RegularizationDetails selectedRegularization={selectedRegularization} onClose={handleSheetClose} />
                )}
            </>
        );
    };

    // Filter for Daily Report or Regularization
    const displayedEntries = activeAttendanceTab === 'dailyReport'
        ? filterDailyReportEntries(filteredEntries) // Filtered entries passed here
        : filterRegularizationEntries(filteredEntries);

    const calculateHoursBetweenLoginLogout = (entries: LoginEntry[]) => {
        const login = entries.find((entry) => entry.action === 'login');
        const logout = entries.find((entry) => entry.action === 'logout');

        if (login && logout) {
            const loginTime = new Date(login.timestamp).getTime();
            const logoutTime = new Date(logout.timestamp).getTime();
            const diffMs = logoutTime - loginTime; // This will now work, as .getTime() returns a number
            const diffHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
            return diffHours.toFixed(2); // Hours rounded to 2 decimal places
        }
        return '0';
    };

    // Define state variables for counts and hours
    const [daysCount, setDaysCount] = useState(0);
    const [regularizedCount, setRegularizedCount] = useState(0);
    const [verifiedCount, setVerifiedCount] = useState(0);
    const [totalHours, setTotalHours] = useState(0);

    // Calculate counts and hours based on filtered entries
    useEffect(() => {
        const dailyReportEntries = filterDailyReportEntries(filteredEntries);

        const uniqueDays = new Set(dailyReportEntries.map(entry => new Date(entry.timestamp).toLocaleDateString()));
        const totalRegularized = dailyReportEntries.filter(entry => entry.action === 'regularization').length;
        const verifiedRegularized = dailyReportEntries.filter(entry => entry.approvalStatus === 'Approved').length;

        let totalHoursAcc = 0;
        uniqueDays.forEach(day => {
            const entriesForDay = dailyReportEntries.filter(entry => new Date(entry.timestamp).toLocaleDateString() === day);
            totalHoursAcc += parseFloat(calculateHoursBetweenLoginLogout(entriesForDay));
        });

        setDaysCount(uniqueDays.size);
        setRegularizedCount(totalRegularized);
        setVerifiedCount(verifiedRegularized);
        setTotalHours(Number(totalHoursAcc.toFixed(2))); // Ensure that you're passing a number
    }, [filteredEntries, activeAttendanceTab]);


    const isToday = (someDate: Date) => {
        const today = new Date();
        return (
            someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear()
        );
    };

    // Filter function to get today's login entries
    const filterTodayEntries = (entries: LoginEntry[]) => {
        return entries.filter((entry) => isToday(new Date(entry.timestamp)));
    };

    const todayEntries = filterTodayEntries(filteredEntries);


    // Handle accordion toggling
    const toggleDayExpansion = (date: string) => {
        setExpandedDays((prevState) => ({
            ...prevState,
            [date]: !prevState[date],
        }));
    };

    // const groupedEntries = groupEntriesByDay(filteredEntries);

    // Filter approved entries and group them by day
    const filterApprovedEntries = (entries: LoginEntry[]) => {
        return entries.filter((entry) => {
            if (entry.action === 'regularization' && entry.approvalStatus !== 'Approved') {
                return false;
            }
            return true;
        });
    };

    // Grouped entries by day
    const groupedEntries = groupEntriesByDay(filterApprovedEntries(filteredEntries));

    // console.log(displayedEntries, 'loginEntries');
    return (
        <div className="container h-screen overflow-y-scroll rounded-lg p-4 shadow-lg">
            <Toaster />
            {displayLoader && (
                <div className="absolute  w-screen h-screen  z-[100]  inset-0 bg-[#211024] -900  bg-opacity-90 rounded-xl flex justify-center items-center">
                    {/* <Toaster /> */}
                    <div
                        className=" z-[100]  max-h-screen max-w-screen text-[#D0D3D3] w-[100%] rounded-lg ">
                        <div className="">
                            <div className="absolute z-50 inset-0 flex flex-col items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">

                                <img src="/logo/loader.png" className="h-[15%] animate-pulse" />
                                <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b text-sm from-white/80 to-white/20">
                                    Loading...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {attendanceLoading && (
                <div className="absolute  w-screen h-screen  z-[100]  inset-0 bg-[#211024] -900  bg-opacity-90 rounded-xl flex justify-center items-center">
                    {/* <Toaster /> */}
                    <div
                        className=" z-[100]  max-h-screen max-w-screen text-[#D0D3D3] w-[100%] rounded-lg ">
                        <div className="">
                            <div className="absolute z-50 inset-0 flex flex-col items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">

                                <img src="/logo/loader.png" className="h-[15%] animate-pulse" />
                                <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b text-sm from-white/80 to-white/20">
                                    Loading...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="login-section flex justify-center mb-6">
                {hasRegisteredFaces ? (
                    <button
                        onClick={handleLoginLogout}
                        className={`bg-${isLoggedIn ? 'red-500' : '[#017a5b]'} -500 text-white py-2 px-4 rounded text-sm`}
                    >
                        {isLoggedIn ? 'Logout' : 'Login'}
                    </button>
                ) : (
                    <button
                        onClick={() => setIsRegisterFaceModalOpen(true)}
                        className="bg-[#75517B] text-white py-2 px-6 rounded text-xs"
                    >
                        Register Faces
                    </button>
                )}
            </div>
            {/* Login/Logout Button */}
            {/* <div className="login-section flex justify-center mb-6">
                <button
                    onClick={handleLoginLogout}
                    className={`bg-${isLoggedIn ? 'red' : 'green'}-500 text-white py-2 px-6 rounded-lg font-semibold`}
                >
                    {isLoggedIn ? 'Logout' : 'Login'}
                </button>
            </div> */}
            {/* Apply Regularization Button */}


            <div className="last-two-days-entries p-4 w-full justify-center flex mb-6">
                {todayEntries.length === 0 ? (
                    <div className='bg-[#1a1c20] w-1/2 rounded p-4'>
                        <div className='flex w-full justify-center'>
                            <img src='/animations/not found.gif' className='h-40 ' />
                        </div>
                        <h1 className='text-center text-sm'>No Entries found for today!</h1>
                        <p className='text-center text-[9px]'>Click on Login to log your attendance</p>
                    </div>
                ) : (
                    <div className="space-y-4 bg-[#1a1c20]  rounded p-4 w-full mx-12">
                        {todayEntries.map((entry: LoginEntry, index: number) => {
                            const date = new Date(entry.loginTime);
                            return (
                                <div key={index} className="flex gap-4 justify-around w-full">
                                    <div>
                                        <h1 className='text-xs py-1'>Login: {entry.loginTime}</h1> {/* Displaying the date */}
                                    </div>
                                    <div>
                                        <h2 className='text-xs py-1'>Logout: {entry.logoutTime}</h2> {/* Displaying the time */}
                                    </div>
                                    <div className={`px-2 py-1  text-xs border rounded-xl text-white ${entry.action === 'login' ? 'bg-green-600 text-xs' : 'bg-[#8A3D17] text-xs'}`}>
                                        <h1 className='text-xs'>
                                            {entry.action.toUpperCase()}
                                        </h1>
                                    </div>
                                    {/* Render map icon only if lat and lng are present */}
                                    {entry.lat && entry.lng && (
                                        <div>
                                            <button onClick={() => handleViewMap(entry.lat, entry.lng)} className="underline text-gray-500 ml-2">
                                                <MapPin />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="apply-regularization-section flex justify-center mb-6">
                <button
                    onClick={() => setIsRegularizationModalOpen(true)}
                    className="bg-[#017A5B] text-white py-2 px-4 rounded text-sm"
                >
                    Apply Regularization
                </button>
            </div>
            {/* Tabs for filtering entries */}
            <div className="tabs mb-6 flex flex-wrap justify-center space-x-2">
                <button onClick={() => setActiveTab('today')} className={`px-4 h-fit py-2 text-xs rounded ${activeTab === 'today' ? 'bg-[#7c3987]' : 'bg-[#28152e] '}`}>Today</button>
                <button onClick={() => setActiveTab('yesterday')} className={`px-4 h-fit py-2 text-xs rounded ${activeTab === 'yesterday' ? 'bg-[#7c3987]' : 'bg-[#28152e]'}`}>Yesterday</button>
                <button onClick={() => setActiveTab('thisWeek')} className={`px-4 py-2 h-fit text-xs rounded ${activeTab === 'thisWeek' ? 'bg-[#7c3987]' : 'bg-[#28152e]'}`}>This Week</button>
                <button onClick={() => setActiveTab('lastWeek')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'lastWeek' ? 'bg-[#7c3987]' : 'bg-[#28152e]'}`}>Last Week</button>
                <button onClick={() => setActiveTab('thisMonth')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'thisMonth' ? 'bg-[#7c3987]' : 'bg-[#28152e]'}`}>This Month</button>
                <button onClick={() => setActiveTab('lastMonth')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'lastMonth' ? 'bg-[#7c3987]' : 'bg-[#28152e]'}`}>Last Month</button>
                <button onClick={() => setActiveTab('allTime')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'allTime' ? 'bg-[#7c3987]' : 'bg-[#28152e]'}`}>All Time</button>
                <button onClick={openCustomModal} className="px-4 py-2 rounded bg-transparent border text-xs">Custom</button>
            </div>
            <div className="flex justify-center gap-4 mt-2 mb-6">
                <button
                    onClick={() => setActiveAttendanceTab('dailyReport')}
                    className={`px-4 py-2 text-xs rounded ${activeAttendanceTab === 'dailyReport' ? 'bg-[#7c3987]' : 'bg-[#28152e] '}`}
                >
                    Daily Report
                </button>
                <button
                    onClick={() => setActiveAttendanceTab('regularization')}
                    className={`px-4 py-2 text-xs rounded ${activeAttendanceTab === 'regularization' ? 'bg-[#7c3987]' : 'bg-[#28152e] '}`}
                >
                    Regularization
                </button>
            </div>

            {/* Display login/logout entries */}
            <div className="entries-list mb-36">
                {activeAttendanceTab === 'dailyReport' ? (
                    <>
                        {Object.keys(groupedEntries).length === 0 ? (
                            <p className="text-center text-gray-600">No Entries for the selected time frame!</p>
                        ) : (
                            <>
                                <div className="flex justify-center mb-4 gap-4">
                                    <div className="text-xs border px-4 py-1 ">Days: {daysCount}</div>
                                    <div className="text-xs border px-4 py-1">Verified: {verifiedCount}</div>
                                    <div className="text-xs border px-4 py-1">Regularized: {regularizedCount}</div>
                                    <div className="text-xs border px-4 py-1">Hours: {totalHours}</div>
                                </div>

                                {Object.keys(groupedEntries).map((date, index) => (
                                    <div key={index} className="mb-4 ">
                                        <div
                                            onClick={() => toggleDayExpansion(date)}
                                            className="w-full grid cursor-pointer grid-cols-3 gap-2 text-xs text-left  border text-white px-4 py-2 rounded rounded-b-none"
                                        >
                                            <div className='flex gap-2'>
                                                <Calendar className='h-4' />    {date}
                                            </div>
                                            <div className='flex gap-2'>
                                                <Clock className='h-4' /> {calculateHoursBetweenLoginLogout(groupedEntries[date])} hours
                                            </div>
                                            <div className="flex justify-end">
                                                <span
                                                    className={`transition-transform duration-300 ${expandedDays[date] ? 'rotate-180' : 'rotate-0'}`}
                                                >
                                                    {/* Use a caret icon (chevron-down) */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                        {expandedDays[date] && (
                                            <div className="p-4 border rounded rounded-t-none">
                                                {groupedEntries[date].map((entry, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center p-2 text-xs  rounded mb-2"
                                                    >
                                                        <span>   {`Login: ${formatTimeToAMPM(entry.loginTime)} - Logout: ${formatTimeToAMPM(entry.logoutTime)}`}</span>
                                                        <span className={`text-xs border h-fit w-fit px-2 py-1  rounded-2xl ${entry.action === 'login' ? 'bg-[#017a5b] ' : 'bg-[#8a3d17]'}`}>
                                                            {entry.action.toUpperCase()}
                                                        </span>
                                                        {entry.lat && entry.lng && (
                                                            <button
                                                                onClick={() => handleViewMap(entry.lat, entry.lng)}
                                                                className="underline text-[#ffffff]"
                                                            >
                                                                <MapPinIcon />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                ) : (
                    // Render regularization entries
                    renderRegularizationEntries()
                )}
            </div>

            {/* Radix UI Dialog for Face Login */}
            <Dialog.Root open={isModalOpen} onOpenChange={handleModalChange}>
                <Dialog.Trigger asChild></Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                    <Dialog.Content className="fixed inset-0 flex justify-center items-center">
                        <div className="bg-[#1A1C20] z-[100] p-6 rounded-lg max-w-md w-full relative">
                            <div className='w-full flex mb-4 justify-between'>

                                <h3 className="text-sm text-white text-center ">
                                    {isLoggedIn ? `Logout at ${new Date().toLocaleTimeString()}` : `Login at ${new Date().toLocaleTimeString()}`}
                                </h3>
                                <Dialog.DialogClose className=''>X</Dialog.DialogClose>

                            </div>
                            {/* Webcam or Captured Image Display */}
                            <div className="relative w-full h-auto mb-4">
                                {capturedImage ? (
                                    <img src={capturedImage} alt="Captured" className="w-full h-auto rounded-lg" />
                                ) : (
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-auto rounded-lg"
                                    />
                                )}

                                {/* Face Logging Animation (if capturedImage exists) */}
                                {capturedImage && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Example face detection animation */}
                                        <div className="face-animation">
                                            <div className="border-4 border-green-500 rounded-full p-4"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Single Camera Button to Capture and Submit */}
                            <button
                                onClick={captureImageAndSubmitLogin}
                                className="bg-[#017A5B] text-white py-2 px-4 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <Camera className="w-6 h-6" /> {/* Replace with an actual camera icon */}
                            </button>

                            {/* Display Lat and Long */}
                            <div className="text-center flex w-full justify-center text-xs text-gray-400">
                                <p className='flex gap-2'>
                                    <MapPinIcon className='h-4' />
                                    {location ? `Lat: ${location.lat}, Long: ${location.lng}` : 'Fetching location...'}
                                </p>
                            </div>
                            {/* Show Loader if submitting */}
                            {isLoading && <Loader />}
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
                            <div className='flex justify-between'>
                                <h3 className="text-xs mb-4 text-white">Select Custom Date Range</h3>
                                <Dialog.DialogClose className='h-2 scale-75'>X</Dialog.DialogClose>
                            </div>

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
                                    <label htmlFor="start" className="absolute -mt-2 bg-[#1a1c20] ml-2 text-xs  font-medium text-white -200">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="start"
                                        name="start"
                                        required
                                        className="mt-1 block w-full p-2 text-xs  rounded"
                                    />
                                </div>

                                {/* End Date Input */}
                                <div className='mt-2'>
                                    <label htmlFor="end" className="absolute text-xs ml-2 bg-[#1a1c20] -mt-2  font-medium text-white">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="end"
                                        name="end"
                                        required
                                        className="mt-1 block w-full p-2 text-xs  rounded"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <button
                                        type="submit"
                                        className="bg-[#017A5B] text-white py-2 px-4 rounded w-full text-xs"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/**Regularization Modal */}
            <Dialog.Root open={isRegularizationModalOpen} onOpenChange={setIsRegularizationModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[50] bg-black/50" />
                    <Dialog.Content className="fixed inset-0 z-[100] flex justify-center items-center">
                        <div className="bg-[#1A1C20] z-[100] p-6 rounded-lg max-w-lg w-full relative">
                            <div className="w-full flex mb-4 justify-between">
                                <h3 className="text-md font-medium mb-4 text-white">Apply Regularization</h3>
                                <Dialog.DialogClose className="">X</Dialog.DialogClose>
                            </div>

                            <form onSubmit={handleSubmitRegularization} className="space-y-4">
                                {/* Date Input */}
                                <div className="relative mb-">
                                    <Dialog.Root open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                        <Dialog.DialogTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() => setIsDatePickerOpen(true)}
                                                className="rounded border w-full px-3 flex gap-1 py-2"
                                            >
                                                <Calendar className="h-5 text-sm" />
                                                {regularizationDate ? (
                                                    // Show the selected date if a date has been picked
                                                    <h1 className='text-xs'>{regularizationDate}</h1>
                                                ) : (
                                                    <h1 className="text-xs">Select Date</h1>
                                                )}
                                            </button>
                                        </Dialog.DialogTrigger>
                                        <Dialog.Portal>
                                            <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50" />
                                            <Dialog.Content className="fixed inset-0 z-[100] bg-black/50  flex justify-center items-center">
                                                <div className="bg-[#1A1C20] z-[20] p-6 rounded-lg max-w-xl scale-75 w-full relative">
                                                    <div className="w-full flex mb-4 justify-between">
                                                        <CustomDatePicker
                                                            selectedDate={regularizationDate ? new Date(regularizationDate) : null}
                                                            onDateChange={(newDate) => {
                                                                // Manually extract the local date (year, month, day)
                                                                const localDate = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
                                                                    .toISOString()
                                                                    .split('T')[0];
                                                                setRegularizationDate(localDate);
                                                                setIsDatePickerOpen(false); // Close the picker after selecting the date
                                                            }}
                                                            onCloseDialog={() => setIsDatePickerOpen(false)}
                                                        />
                                                    </div>
                                                </div>
                                            </Dialog.Content>
                                        </Dialog.Portal>
                                    </Dialog.Root>
                                </div>

                                {/* Login Time Input */}
                                <div className="relative ">
                                    <label htmlFor="loginTime" className="absolute bg-[#1A1C20] ml-2 text-xs z-[100] -mt-2 px-1 text-white">
                                        Login Time
                                    </label>
                                    <input
                                        type="time"
                                        id="loginTime"
                                        value={regularizationLoginTime}
                                        onChange={(e) => setRegularizationLoginTime(e.target.value)}
                                        required
                                        className="w-full text-sm p-2 outline-none border opacity-65 rounded bg-transparent"
                                    />
                                </div>

                                {/* Logout Time Input */}
                                <div className="relative">
                                    <label htmlFor="logoutTime" className="absolute bg-[#1A1C20] ml-2 z-[100] text-xs -mt-2 px-1 text-white -400">
                                        Logout Time
                                    </label>
                                    <input
                                        type="time"
                                        id="logoutTime"
                                        value={regularizationLogoutTime}
                                        onChange={(e) => setRegularizationLogoutTime(e.target.value)}
                                        required
                                        className="w-full text-sm p-2 outline-none border rounded opacity-65 bg-transparent"
                                    />
                                </div>

                                {/* Remarks Textarea */}
                                <div className="relative">
                                    <label htmlFor="remarks" className="absolute bg-[#1A1C20] z-[100] ml-2 text-xs -mt-2 px-1 text-white">
                                        Remarks
                                    </label>
                                    <textarea
                                        id="remarks"
                                        value={regularizationRemarks}
                                        onChange={(e) => setRegularizationRemarks(e.target.value)}
                                        required
                                        className="w-full text-sm p-2 outline-none border rounded opacity-65 bg-transparent"
                                        rows={3}
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <div>
                                    {isSubmittingRegularization ? (
                                        <Loader />
                                    ) : (
                                        <button type="submit" className="w-full bg-[#017A5B] text-white py-2 px-4 rounded">
                                            Submit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>


            {/* Register Faces Modal */}
            {/* Register Face Modal */}
            <Dialog.Root open={isRegisterFaceModalOpen} onOpenChange={setIsRegisterFaceModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                    <Dialog.Content className="fixed inset-0 flex justify-center items-center">
                        <div className="bg-[#121212] p-6 rounded-lg max-w-md w-full">
                            <h3 className="text-lg mb-4">Register Faces (Upload 3 Images)</h3>

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="block w-full mb-4"
                            />

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {selectedImages.length > 0 &&
                                    selectedImages.map((file, index) => (
                                        <div key={index}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`preview-${index}`}
                                                className="w-full h-auto"
                                            />
                                        </div>
                                    ))}
                            </div>

                            <button
                                onClick={handleFaceRegistrationSubmit}
                                className="bg-green-500 text-white py-2 px-4 rounded w-full"
                            >
                                Submit Face Registration
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
