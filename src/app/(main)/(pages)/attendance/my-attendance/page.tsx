"use client";

import React, { useState, useEffect } from "react";
import Loader from "@/components/ui/loader";
import * as Dialog from "@radix-ui/react-dialog";
import Webcam from "react-webcam";
import {
  BookIcon,
  Calendar,
  CalendarClock,
  Camera,
  CheckCircle,
  Clock,
  Globe,
  MapPin,
  MapPinIcon,
  Users2,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";



// Remove the top-level import of Leaflet
// import L from 'leaflet';

// Import Leaflet CSS (this is okay because CSS imports don't execute JS code)
import { toast, Toaster } from "sonner";
import RegularizationDetails from "@/components/sheets/regularizationDetails";
import CustomDatePicker from "@/components/globals/date-picker";
import { Button } from "@/components/ui/button";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';


const mapContainerStyle = {
  height: "400px",
  width: "100%",
};

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
  action: "login" | "logout" | "regularization";
  approvalStatus?: "Pending" | "Approved" | "Rejected"; // Add the approvalStatus field
  loginTime: string;
  logoutTime: string;
  remarks: string;
  notes?: string;
}

// Helper function to group entries by day
const groupEntriesByDay = (
  entries: LoginEntry[] | undefined | null
): { [date: string]: LoginEntry[] } => {
  if (!entries || entries.length === 0) {
    return {}; // Return an empty object if entries are undefined, null, or empty
  }

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
  const [activeTab, setActiveTab] = useState("thisMonth"); // Set default to 'thisMonth'
  const [activeAttendanceTab, setActiveAttendanceTab] = useState("dailyReport");
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // For Face Login Modal
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const webcamRef = React.useRef<Webcam>(null);
  // State variables for Regularization Modal
  const [isRegularizationModalOpen, setIsRegularizationModalOpen] =
    useState(false);
  const [regularizationDate, setRegularizationDate] = useState("");
  const [regularizationLoginTime, setRegularizationLoginTime] = useState("");
  const [regularizationLogoutTime, setRegularizationLogoutTime] = useState("");
  const [regularizationRemarks, setRegularizationRemarks] = useState("");
  const [isSubmittingRegularization, setIsSubmittingRegularization] =
    useState(false);
  const [hasRegisteredFaces, setHasRegisteredFaces] = useState(false);
  const [isRegisterFaceModalOpen, setIsRegisterFaceModalOpen] = useState(false); // Modal for Registering Faces
  const [selectedImages, setSelectedImages] = useState<File[]>([]); // For image selection
  const [expandedDays, setExpandedDays] = useState<{ [date: string]: boolean }>(
    {}
  );
  const [displayLoader, setDisplayLoader] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState<boolean>(false); // Track whether the user manually selects a date
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false); // For triggering the start date picker
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false); // For triggering the end date picker

  const [mapCoords, setMapCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleViewMap = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
    setMapModalOpen(true);
  };


  // useEffect(() => {
  //     if (typeof window !== 'undefined') {
  //         // Dynamically import Leaflet inside useEffect
  //         import('leaflet').then((L) => {
  //             // Dynamically set Leaflet icon options only after the window object is available
  //             delete (L.Icon.Default.prototype as any)._getIconUrl;
  //             L.Icon.Default.mergeOptions({
  //                 iconRetinaUrl:
  //                     'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  //                 iconUrl:
  //                     'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  //                 shadowUrl:
  //                     'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  //             });
  //         });
  //     }
  // }, []);


  useEffect(() => {
    const fetchLoginStatus = async () => {
      try {
        setDisplayLoader(true);
        const res = await fetch("/api/check-login-status");
        const data = await res.json();

        if (data.success) {
          setIsLoggedIn(data.isLoggedIn);
          setHasRegisteredFaces(data.hasRegisteredFaces);
        } else {
          alert(data.error || "Failed to fetch login status.");
        }
      } catch (error) {
        console.error("Error fetching login status:", error);
      } finally {
        setDisplayLoader(false);
      }
    };

    fetchLoginStatus();
  }, []);

  useEffect(() => {
    const fetchLoginEntriesAndStatus = async () => {
      try {
        setDisplayLoader(true);
        // Fetch login entries
        const resEntries = await fetch("/api/loginEntries");
        const dataEntries = await resEntries.json();
        setLoginEntries(dataEntries.entries);

        // Check if the user's face registration is approved
        const resFaceStatus = await fetch(
          "/api/check-face-registration-status"
        );
        const dataFaceStatus = await resFaceStatus.json();

        if (dataFaceStatus.success) {
          setHasRegisteredFaces(dataFaceStatus.isFaceRegistered);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setDisplayLoader(false);
      }
    };

    fetchLoginEntriesAndStatus();
  }, [isLoggedIn]);

  const handleFaceRegistrationSubmit = async () => {
    if (selectedImages?.length !== 3) {
      toast.info("Please upload exactly 3 images.");
      return;
    }

    try {
      // Upload the images first
      setIsLoading(true);
      const formData = new FormData();
      selectedImages.forEach((file) => formData.append("files", file));

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }

      // Send a request to save the face registration request with pending status
      const faceRegistrationResponse = await fetch(
        "/api/face-registration-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrls: uploadData.fileUrls, // URLs from the image upload
          }),
        }
      );

      const faceRegistrationData = await faceRegistrationResponse.json();
      if (faceRegistrationResponse.ok && faceRegistrationData.success) {
        setIsLoading(false);
        toast.success(
          "Face registration request submitted successfully and is pending approval."
        );
        setIsRegisterFaceModalOpen(false);
        setSelectedImages([]); // Reset images
      } else {
        throw new Error("Face registration request submission failed.");
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
  // const captureImageAndLocation = () => {
  //     const imageSrc = webcamRef.current?.getScreenshot();
  //     if (imageSrc) {
  //         setCapturedImage(imageSrc);
  //     }
  //     if (navigator.geolocation) {
  //         navigator.geolocation.getCurrentPosition((position) => {
  //             setLocation({
  //                 lat: position.coords.latitude,
  //                 lng: position.coords.longitude,
  //             });
  //         });
  //     }
  // };

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
    const arr = dataurl.split(",");
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
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const normalizeDate = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const todayNormalized = normalizeDate(today);

    switch (activeTab) {
      case "today":
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return entryDate.getTime() === todayNormalized.getTime();
        });
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayNormalized = normalizeDate(yesterday);
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return entryDate.getTime() === yesterdayNormalized.getTime();
        });
      case "thisWeek":
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return (
            entryDate >= normalizeDate(thisWeekStart) &&
            entryDate <= todayNormalized
          );
        });
      case "lastWeek":
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return (
            entryDate >= normalizeDate(lastWeekStart) &&
            entryDate <= normalizeDate(lastWeekEnd)
          );
        });
      case "thisMonth":
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return (
            entryDate >= normalizeDate(thisMonthStart) &&
            entryDate <= todayNormalized
          );
        });
      case "lastMonth":
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return (
            entryDate >= normalizeDate(lastMonthStart) &&
            entryDate <= normalizeDate(lastMonthEnd)
          );
        });
      case "allTime":
        return loginEntries;
      case "custom":
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



  // Open custom date range modal
  const openCustomModal = () => {
    setIsCustomModalOpen(true);
  };

  // Handle custom date range submit
  const handleCustomDateSubmit = (start: Date, end: Date) => {
    setCustomDateRange({ start, end });
    setIsCustomModalOpen(false);
    setActiveTab("custom");
  };

  // Handle Regularization Form Submission
  const handleSubmitRegularization = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !regularizationDate ||
      !regularizationLoginTime ||
      !regularizationLogoutTime ||
      !regularizationRemarks
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmittingRegularization(true);

    try {
      setAttendanceLoading(true);
      const response = await fetch("/api/regularize", {
        method: "POST",
        body: JSON.stringify({
          date: regularizationDate,
          loginTime: regularizationLoginTime,
          logoutTime: regularizationLogoutTime,
          remarks: regularizationRemarks,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Regularization request submitted successfully.");
        // Refresh login entries
        const resEntries = await fetch("/api/loginEntries", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const dataEntries = await resEntries.json();
        setLoginEntries(dataEntries.entries);
        setAttendanceLoading(false);

        // Reset form fields
        setRegularizationDate("");
        setRegularizationLoginTime("");
        setRegularizationLogoutTime("");
        setRegularizationRemarks("");
        setIsRegularizationModalOpen(false);
      } else {
        throw new Error(
          data.message || "Failed to submit regularization request."
        );
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingRegularization(false);
    }
  };

  console.log(loginEntries, "login entries");

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
          console.error("Error fetching location:", error);
          toast.error(
            "Unable to fetch location. Please allow location access."
          );
        }
      );
    }
  }, [isModalOpen]);

  console.log(location, "location");

  const handleModalChange = (isOpen: boolean) => {
    if (isOpen) {
      // If location is not already fetched, fetch it when the modal opens
      if (!location) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.error("Error fetching location:", error);
              toast.error(
                "Unable to fetch location. Please allow location access."
              );
            }
          );
        }
      }
      setCapturedImage(null); // Reset the captured image when modal opens
      console.log(location, "location in the modal");
    } else {
      setCapturedImage(null);
    }
    setIsModalOpen(isOpen); // Handle modal state
  };

  const captureImageAndSubmitLogin = async () => {
    // Capture image
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }

    if (!imageSrc || !location) {
      toast.error("Please capture an image and ensure location is available.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("files", dataURLtoBlob(imageSrc, "captured_image.jpg"));

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.fileUrls[0];

      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }

      const action = isLoggedIn ? "logout" : "login"; // Determine login or logout action

      const loginResponse = await fetch("/api/face-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setIsLoggedIn(action === "login");
        setIsModalOpen(false); // Close the modal on successful login/logout
      } else {
        throw new Error(loginData.error || "Face recognition failed.");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDailyReportEntries = (entries: LoginEntry[]) => {
    return entries?.filter((entry) => {
      if (
        entry.action === "regularization" &&
        entry.approvalStatus !== "Approved"
      ) {
        return false;
      }
      return true;
    });
  };

  const filterRegularizationEntries = (entries: LoginEntry[]) => {
    return entries?.filter((entry) => entry.action === "regularization");
  };

  function formatTimeToAMPM(timeString: string | undefined): string {
    if (!timeString) {
      return ""; // Return an empty string or a placeholder if timeString is undefined
    }

    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const [selectedRegularization, setSelectedRegularization] =
    useState<LoginEntry | null>(null);

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
        {regularizationEntries?.length === 0 ? (
          <p className="text-center text-gray-600">
            No Regularization Entries found!
          </p>
        ) : (
          <ul className="space-y-4">
            {regularizationEntries.map((entry, index) => (
              <li
                key={index}
                onClick={() => handleRegularizationClick(entry)}
                className="flex cursor-pointer border text-xs justify-between items-center px-4 py-2 rounded shadow-md"
              >
                {entry.userId && (
                  <div className="flex gap-2 justify-start">
                    <div className="h-6 w-6 rounded-full bg-[#815BF5]">
                      <h1 className="text-center uppercase text-xs mt-1">
                        {entry.userId.firstName[0]}
                        {entry.userId.lastName[0]}
                      </h1>
                    </div>
                    <h1
                      id="userName"
                      className="col-span-3 text-sm"
                    >{`${entry.userId.firstName} ${entry.userId.lastName}`}</h1>
                  </div>
                )}
                <span>
                  {`Login: ${formatTimeToAMPM(
                    entry.loginTime
                  )} - Logout: ${formatTimeToAMPM(entry.logoutTime)}`}
                </span>

                {/* Display approvalStatus */}
                <span
                  className={
                    entry.approvalStatus === "Approved"
                      ? "bg-[#017a5b] px-2 py-1 rounded-xl"
                      : entry.approvalStatus === "Rejected"
                        ? "bg-red-800 rounded-xl px-2 py-1"
                        : "bg-orange-800 px-2 py-1 rounded-xl"
                  }
                >
                  {/* {`Approval Status: `} */}
                  <strong>{entry.approvalStatus}</strong>
                </span>

                {/* If lat and lng are present, render the map icon */}
                {entry.lat && entry.lng && (
                  <button
                    onClick={() => handleViewMap(entry.lat, entry.lng)}
                    className="underline text-blue-500 ml-2"
                  >
                    <MapPin />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {selectedRegularization && (
          <RegularizationDetails
            selectedRegularization={selectedRegularization}
            onClose={handleSheetClose}
          />
        )}
      </>
    );
  };

  // Filter for Daily Report or Regularization
  const displayedEntries =
    activeAttendanceTab === "dailyReport"
      ? filterDailyReportEntries(filteredEntries) // Filtered entries passed here
      : filterRegularizationEntries(filteredEntries);

  const calculateHoursBetweenLoginLogout = (entries: LoginEntry[]) => {
    const login = entries?.find((entry) => entry.action === "login");
    const logout = entries?.find((entry) => entry.action === "logout");

    if (login && logout) {
      const loginTime = new Date(login.timestamp).getTime();
      const logoutTime = new Date(logout.timestamp).getTime();
      const diffMs = logoutTime - loginTime; // This will now work, as .getTime() returns a number
      const diffHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
      return diffHours.toFixed(2); // Hours rounded to 2 decimal places
    }
    return "0";
  };

  // Define state variables for counts and hours
  const [daysCount, setDaysCount] = useState(0);
  const [regularizedCount, setRegularizedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  // Calculate counts and hours based on filtered entries
  useEffect(() => {
    const dailyReportEntries = filterDailyReportEntries(filteredEntries);

    const uniqueDays = new Set(
      dailyReportEntries?.map((entry) =>
        new Date(entry.timestamp).toLocaleDateString()
      )
    );
    const totalRegularized = dailyReportEntries?.filter(
      (entry) => entry.action === "regularization"
    ).length;
    const verifiedRegularized = dailyReportEntries?.filter(
      (entry) => entry.approvalStatus === "Approved"
    ).length;

    let totalHoursAcc = 0;
    uniqueDays.forEach((day) => {
      const entriesForDay = dailyReportEntries?.filter(
        (entry) => new Date(entry.timestamp).toLocaleDateString() === day
      );
      totalHoursAcc += parseFloat(
        calculateHoursBetweenLoginLogout(entriesForDay)
      );
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
    return entries?.filter((entry) => {
      // Exclude regularization entries and only include login and logout actions
      return (
        isToday(new Date(entry.timestamp)) &&
        (entry.action === "login" || entry.action === "logout")
      );
    });
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
    return entries?.filter((entry) => {
      if (
        entry.action === "regularization" &&
        entry.approvalStatus !== "Approved"
      ) {
        return false;
      }
      return true;
    });
  };

  // Grouped entries by day
  const groupedEntries = groupEntriesByDay(
    filterApprovedEntries(filteredEntries)
  );

  // console.log(displayedEntries, 'loginEntries');
  return (
    <div className="container h-screen overflow-y-scroll scrollbar-hide rounded-lg p-4 shadow-lg">
      <Toaster />
      {displayLoader && (
        <div className="absolute  w-screen h-screen  z-[100]  inset-0 bg-[#04061e] -900  bg-opacity-90 rounded-xl flex justify-center items-center">
          {/* <Toaster /> */}
          <div className=" z-[100]  max-h-screen max-w-screen text-[#D0D3D3] w-[100%] rounded-lg ">
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
          <div className=" z-[100]  max-h-screen max-w-screen text-[#D0D3D3] w-[100%] rounded-lg ">
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
            className={`bg-${isLoggedIn ? "red-800" : "[#017a5b]"
              } -500 text-white py-2 px-4 rounded text-sm`}
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        ) : (
          <button
            onClick={() => setIsRegisterFaceModalOpen(true)}
            className="bg-[#815BF5] text-white py-2 px-6 rounded text-xs"
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
        {todayEntries?.length === 0 ? (
          <div className='bg-[#] border w-1/2 rounded p-4'>
            <div className='flex w-full justify-center'>
              <img src='/animations/not found.gif' className='h-40 ' />
            </div>
            <h1 className='text-center text-sm'>No Entries found for today!</h1>
            <p className='text-center text-[9px]'>Click on Login to log your attendance</p>
          </div>
        ) : (
          <div className="space-y-4 bg-[#0B0D29]  rounded p-4 w-[60%] mx-12">
            {todayEntries?.map((entry: LoginEntry, index: number) => {
              const formattedLoginTime = new Date(entry.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
              const formattedLogoutTime = entry.logoutTime
                ? new Date(entry.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                : null;
              const date = new Date(entry.loginTime);
              return (
                <div key={index} className=" w-full  grid grid-cols-3">
                  {entry.loginTime && (
                    <div>
                      <h1 className='text-xs py-1'>Login: {formattedLoginTime}</h1> {/* Displaying the date */}
                    </div>
                  )}
                  {entry.logoutTime && (
                    <div>
                      <h2 className='text-xs py-1'>Logout: {formattedLogoutTime}</h2>
                    </div>
                  )}
                  <div className={`px-2 py-1 h-6 w-fit flex justify-center  text-xs border rounded-xl text-white ${entry.action === 'login' ? 'bg-green-800 text-xs' : 'bg-[#8A3D17] text-xs'}`}>
                    <h1 className='text-xs'>
                      {entry.action.toUpperCase()}
                    </h1>
                  </div>
                  {/* Render map icon only if lat and lng are present */}
                  {entry.lat && entry.lng && (
                    <div className='flex justify-end '>
                      <button onClick={() => handleViewMap(entry.lat, entry.lng)} className="underline text-white h-5 -500 ">
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
          className="bg-[#017A5B] text-white py-2 px-4 rounded text-xs"
        >
          Apply Regularization
        </button>
      </div>
      {/* Tabs for filtering entries */}
      <div className="tabs mb-6 flex flex-wrap justify-center space-x-2">
        <button onClick={() => setActiveTab('today')} className={`px-4 h-fit py-2 text-xs rounded ${activeTab === 'today' ? 'bg-[#815BF5]' : 'bg-[#37384B] '}`}>Today</button>
        <button onClick={() => setActiveTab('yesterday')} className={`px-4 h-fit py-2 text-xs rounded ${activeTab === 'yesterday' ? 'bg-[#815BF5]' : 'bg-[#37384B]'}`}>Yesterday</button>
        <button onClick={() => setActiveTab('thisWeek')} className={`px-4 py-2 h-fit text-xs rounded ${activeTab === 'thisWeek' ? 'bg-[#815BF5]' : 'bg-[#37384B]'}`}>This Week</button>
        <button onClick={() => setActiveTab('lastWeek')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'lastWeek' ? 'bg-[#815BF5]' : 'bg-[#37384B]'}`}>Last Week</button>
        <button onClick={() => setActiveTab('thisMonth')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'thisMonth' ? 'bg-[#815BF5]' : 'bg-[#37384B]'}`}>This Month</button>
        <button onClick={() => setActiveTab('lastMonth')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'lastMonth' ? 'bg-[#815BF5]' : 'bg-[#37384B]'}`}>Last Month</button>
        <button onClick={() => setActiveTab('allTime')} className={`px-4 py-2 text-xs h-fit rounded ${activeTab === 'allTime' ? 'bg-[#815BF5]' : 'bg-[#37384B]'}`}>All Time</button>
        <button onClick={openCustomModal} className={`px-4 py-2 rounded bg-[#37384B] text-xs border ${customDateRange.start && customDateRange.end ? 'bg-[#815BF5] text-white' : 'bg-transparent'
          }`}>Custom</button>
      </div>
      <div className="flex justify-center gap-4 mt-2 mb-6">
        <button
          onClick={() => setActiveAttendanceTab('dailyReport')}
          className={`px-4 flex gap-2 py-2 text-xs rounded ${activeAttendanceTab === 'dailyReport' ? 'bg-[#815BF5]' : 'bg-[#37384B] '}`}
        >
          <img src='/icons/report.png' className='invert-[100] h-4' />
          Daily Report
        </button>
        <button
          onClick={() => setActiveAttendanceTab('regularization')}
          className={`px-4 flex gap-2 py-2 text-xs rounded ${activeAttendanceTab === 'regularization' ? 'bg-[#815BF5]' : 'bg-[#37384B] '}`}
        >
          <Users2 className='h-4' />
          Regularization
        </button>
      </div>

      {/* Display login/logout entries */}
      <div className="entries-list mb-36">
        {activeAttendanceTab === "dailyReport" ? (
          <>
            {Object.keys(groupedEntries)?.length === 0 ? (
              <p className="text-center text-gray-600">
                No Entries for the selected time frame!
              </p>
            ) : (
              <>
                <div className="flex justify-center mb-4 gap-4">
                  <div className="text-xs flex  border px-4 py-2 ">
                    <Calendar className="h-4 text-blue-500 mt-[1px]" />
                    <h1 className="text-xs mt-[1px] ">Days: {daysCount}</h1>
                  </div>
                  <div className="text-xs flex border px-4 py-2">
                    <CheckCircle className="h-4 text-green-500 mt-[1px]" />
                    <h1 className="text-xs mt-[1px]">
                      {" "}
                      Verified: {verifiedCount}
                    </h1>
                  </div>
                  <div className="text-xs flex  border px-4 py-2">
                    <CalendarClock className="h-4 text-white" />
                    <h1 className="mt-[1px]">
                      Regularized: {regularizedCount}
                    </h1>
                  </div>
                  <div className="text-xs border flex px-4 py-2">
                    <Clock className="h-4 mt-[1px] text-orange-600" />
                    <h1 className="text-xs mt-[1px]">Hours: {totalHours}</h1>
                  </div>
                </div>

                {Object.keys(groupedEntries || {}).map((date, index) => (
                  <div key={index} className="mb-4 ">
                    <div
                      onClick={() => toggleDayExpansion(date)}
                      className="w-full grid cursor-pointer grid-cols-3 gap-2 text-xs text-left  border text-white px-4 py-2 rounded rounded-b-none"
                    >
                      <div className="flex gap-2">
                        <Calendar className="h-4" /> {date}
                      </div>
                      <div className="flex gap-2">
                        <Clock className="h-4" />{" "}
                        {calculateHoursBetweenLoginLogout(groupedEntries[date])}{" "}
                        hours
                      </div>
                      <div className="flex justify-end">
                        <span
                          className={`transition-transform duration-300 ${expandedDays[date] ? "rotate-180" : "rotate-0"
                            }`}
                        >
                          {/* Use a caret icon (chevron-down) */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                    {expandedDays[date] && (
                      <div className="p-4 border rounded rounded-t-none">
                        {groupedEntries[date].map((entry, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 text-xs rounded mb-2"
                          >
                            <span>
                              {`${entry.action.charAt(0).toUpperCase() +
                                entry.action.slice(1)
                                }: ${formatTimeToAMPM(entry.timestamp)}`}
                            </span>
                            <span
                              className={`text-xs border h-fit w-fit px-2 py-1 rounded-2xl ${entry.action === "login"
                                ? "bg-[#017a5b]"
                                : "bg-[#8a3d17]"
                                }`}
                            >
                              {entry.action.toUpperCase()}
                            </span>
                            {entry.lat && entry.lng && (
                              <button
                                onClick={() =>
                                  handleViewMap(entry.lat, entry.lng)
                                }
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
            <div className="bg-[#0B0D29] z-[100] p-6 rounded-lg max-w-md w-full relative">
              <div className="w-full flex mb-4 justify-between">
                <h3 className="text-sm text-white text-center ">
                  {isLoggedIn
                    ? `Logout at ${new Date().toLocaleTimeString()}`
                    : `Login at ${new Date().toLocaleTimeString()}`}
                </h3>
                <Dialog.DialogClose className="">X</Dialog.DialogClose>
              </div>
              {/* Webcam or Captured Image Display */}
              <div className="relative w-full h-auto mb-4">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-auto rounded-lg"
                  />
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
                    {/* Example face detection animtion */}
                    <div className="face-animation">
                      <img
                        src="/animations/facelogin.png"
                        className="h-28 animate-ping"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Single Camera Button to Capture and Submit */}
              <button
                onClick={captureImageAndSubmitLogin}
                className="bg-[#017A5B] text-white py-2 px-4 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Camera className="w-6 h-6" />{" "}
                {/* Replace with an actual camera icon */}
              </button>

              {/* Display Lat and Long */}
              <div className="text-center flex w-full justify-center text-xs text-white -400">
                <p className="flex gap-2 text-sm">
                  <MapPinIcon className="h-4" />
                  {location
                    ? `Lat: ${location.lat}, Long: ${location.lng}`
                    : "Fetching location..."}
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
          <Dialog.Content className="fixed  inset-0 flex justify-center items-center">
            <div className="bg-[#121212] p-4 overflow-y-scroll scrollbar-hide h-[500px]   shadow-lg w-full   max-w-md  rounded-lg">
              <div className="w-full flex justify-between">
                <h1 className="py-4 flex gap-2  ">
                  <Globe className="h-6 text-[#815BF5]" />
                  Geo Location
                </h1>
                <Dialog.DialogClose className="text-white py-4 px-1  ">
                  <CrossCircledIcon className='scale-150 mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]' />
                </Dialog.DialogClose>
              </div>


              {/* {mapCoords && (
                <MapContainer
                  center={[mapCoords.lat, mapCoords.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[mapCoords.lat, mapCoords.lng]}></Marker>
                </MapContainer>
              )} */}
              <div className="">
                {mapCoords && (
                  <LoadScript googleMapsApiKey="AIzaSyASY9lRvSpjIR2skVaTLd6x7M1Kx2zY-4k"> {/* Replace with your API key */}
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCoords}
                      zoom={13}
                      options={{
                        disableDefaultUI: true, // Disable default UI if you want
                        zoomControl: true, // Show zoom control
                      }}
                    >
                      <Marker position={mapCoords} />
                    </GoogleMap>
                  </LoadScript>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Custom Date Range Modal */}
      <Dialog.Root open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
          <Dialog.Content className="fixed inset-0 flex justify-center items-center">
            <div className="bg-[#0B0D29] p-4 rounded-lg max-w-md w-full">
              <div className="flex justify-between">
                <h3 className="text-md mb-4 text-white">
                  Select Custom Date Range
                </h3>
                {/* <Dialog.DialogClose className="h-7 scale-75">
                  <img
                    src="/icons/cross.png"
                    className="h-7 hover:bg-[#121212] rounded-full"
                  />
                </Dialog.DialogClose> */}
                {/* <Dialog.DialogClose className="h-7 scale-75 ">
                  <img src="/icons/cross.png" className="h-7  hover:invert" />
                </Dialog.DialogClose> */}
                {/* <Dialog.DialogClose className="h-7 scale-75 cursor-pointer border rounded-full  hover:bg-white hover:text-black w-7">
                  <img
                    src="/icons/cross.png"
                    className="h-7 rounded-full hover:invert"
                  />
                </Dialog.DialogClose> */}
                {/* <Dialog.DialogClose className="h-7 scale-75 hover:bg-white rounded-full">
                  <img
                    src="/icons/cross.png"
                    className="h-7 hover:invert-0 hover:text-black"
                  />
                </Dialog.DialogClose> */}

                <Dialog.DialogClose className="h-7 scale-75 hover:bg-white rounded-full">
                  <X
                    // onClick={() => setShowOrganizationForm(false)}
                    className="cursor-pointer border rounded-full border-white h-7 hover:bg-white hover:text-black w-7"
                  />
                  {/* <X className="h-7 w-7" /> */}
                </Dialog.DialogClose>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCustomDateSubmit(
                    customDateRange.start as Date,
                    customDateRange.end as Date
                  );
                }}
                className="  space-y-4"
              >
                <div className="flex justify-between gap-2">
                  {/* Start Date Button */}
                  <div className="w-full">
                    {/* <h1 className="absolute bg-[#0B0D29] ml-2 text-xs  font-medium text-white">Start Date</h1> */}
                    <button
                      type="button"
                      className="  text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                      onClick={() => setIsStartPickerOpen(true)} // Open start date picker
                    >
                      {customDateRange.start ? (
                        <div className="flex gap-1">
                          <Calendar className="h-4" />

                          {new Date(customDateRange.start).toLocaleDateString(
                            "en-GB"
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Calendar className="h-4" />
                          <h1 className="text-xs">Start Date</h1>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* End Date Button */}
                  <div className="w-full">
                    {/* <h1 className="absolute bg-[#0B0D29] ml-2 text-xs  font-medium text-white">End Date</h1> */}
                    <button
                      type="button"
                      className="text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                      onClick={() => setIsEndPickerOpen(true)} // Open end date picker
                    >
                      {customDateRange.end ? (
                        <div className="flex gap-1">
                          <Calendar className="h-4" />
                          {new Date(customDateRange.end).toLocaleDateString(
                            "en-GB"
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Calendar className="h-4" />
                          <h1 className="text-xs">End Date</h1>
                        </div>
                      )}
                    </button>
                  </div>
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

      {/* Start Date Picker Modal */}
      <Dialog.Root open={isStartPickerOpen} onOpenChange={setIsStartPickerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black opacity-50" />
          <Dialog.Content className="fixed inset-0 z-[100] flex justify-center items-center">
            <div className="bg-[#0B0D29] p-4 z-[100] rounded-lg max-w-xl  scale-75 w-full">
              <CustomDatePicker
                selectedDate={customDateRange.start}
                onDateChange={(newDate) => {
                  setCustomDateRange((prev) => ({ ...prev, start: newDate }));
                  setIsStartPickerOpen(false); // Close picker after selecting the date
                }}
                onCloseDialog={() => setIsStartPickerOpen(false)}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* End Date Picker Modal */}
      <Dialog.Root open={isEndPickerOpen} onOpenChange={setIsEndPickerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black opacity-50" />
          <Dialog.Content className="fixed inset-0 z-[100] flex justify-center items-center">
            <div className="bg-[#0B0D29] p-4 z-[100] rounded-lg scale-75 max-w-xl w-full">
              <CustomDatePicker
                selectedDate={customDateRange.end}
                onDateChange={(newDate) => {
                  setCustomDateRange((prev) => ({ ...prev, end: newDate }));
                  setIsEndPickerOpen(false); // Close picker after selecting the date
                }}
                onCloseDialog={() => setIsEndPickerOpen(false)}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/**Regularization Modal */}
      <Dialog.Root
        open={isRegularizationModalOpen}
        onOpenChange={setIsRegularizationModalOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[50] bg-black/50" />
          <Dialog.Content className="fixed inset-0 z-[100] flex justify-center items-center">
            <div className="bg-[#0B0D29] z-[100] p-6 rounded-lg max-w-lg w-full relative">
              <div className="w-full flex mb-4 justify-between">
                <h3 className="text-md font-medium mb-4 text-white">
                  Apply Regularization
                </h3>
                <Dialog.DialogClose>
                  {" "}
                  <X className="cursor-pointer border -mt-4 rounded-full border-white h-5 hover:bg-white hover:text-black w-5" />
                </Dialog.DialogClose>
              </div>

              <form onSubmit={handleSubmitRegularization} className="space-y-4">
                {/* Date Input */}
                <div className="relative mb-">
                  <Dialog.Root
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <Dialog.DialogTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(true)}
                        className="rounded border w-full px-3 flex gap-1 py-2"
                      >
                        <Calendar className="h-5 text-sm" />
                        {regularizationDate ? (
                          // Show the selected date if a date has been picked
                          <h1 className="text-xs mt-1">{regularizationDate}</h1>
                        ) : (
                          <h1 className="text-xs mt-1">Select Date</h1>
                        )}
                      </button>
                    </Dialog.DialogTrigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50" />
                      <Dialog.Content className="fixed inset-0 z-[100] bg-black/50  flex justify-center items-center">
                        <div className="bg-[#0B0D29] z-[20] p-6 rounded-lg max-w-xl scale-75 w-full relative">
                          <div className="w-full flex mb-4 justify-between">
                            <CustomDatePicker
                              selectedDate={
                                regularizationDate
                                  ? new Date(regularizationDate)
                                  : null
                              }
                              onDateChange={(newDate) => {
                                // Manually extract the local date (year, month, day)
                                const localDate = new Date(
                                  newDate.getTime() -
                                  newDate.getTimezoneOffset() * 60000
                                )
                                  .toISOString()
                                  .split("T")[0];
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
                {/* <div className="relative ">
                  <label
                    htmlFor="loginTime"
                    className="absolute bg-[#0B0D29] ml-2 text-xs z-[100] -mt-2 px-1 text-white"
                  >
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
                </div> */}
                {/* <div className="relative">
                  <label
                    htmlFor="loginTime"
                    className="absolute bg-[#0B0D29] ml-2 text-xs z-[100] -mt-2 px-1 text-white"
                  >
                    Login Time
                  </label>
                  <input
                    type="time"
                    id="loginTime"
                    value={regularizationLoginTime}
                    onChange={(e) => setRegularizationLoginTime(e.target.value)}
                    onClick={(e) => e.target.showPicker()}
                    onFocus={(e) => e.target.showPicker()} // Trigger the picker when the input is focused
                    required
                    className="w-full text-sm p-2 outline-none border opacity-65 rounded bg-transparent cursor-pointer" // Added cursor-pointer for clickable effect
                  />
                </div> */}
                <div className="relative">
                  <label
                    htmlFor="loginTime"
                    className="absolute bg-[#0B0D29] ml-2 text-xs z-[100] -mt-2 px-1 text-white"
                  >
                    Login Time
                  </label>
                  <input
                    type="time"
                    id="loginTime"
                    value={regularizationLoginTime}
                    onChange={(e) => setRegularizationLoginTime(e.target.value)}
                    onClick={(e) =>
                      (e.target as HTMLInputElement).showPicker?.()
                    } // Cast to HTMLInputElement
                    onFocus={(e) =>
                      (e.target as HTMLInputElement).showPicker?.()
                    } // Cast to HTMLInputElement
                    required
                    className="w-full text-sm p-2 outline-none border opacity-65 rounded bg-transparent cursor-pointer"
                  />
                </div>

                {/* Logout Time Input */}
                <div className="relative">
                  <label
                    htmlFor="logoutTime"
                    className="absolute bg-[#0B0D29] ml-2 z-[100] text-xs -mt-2 px-1 text-white -400"
                  >
                    Logout Time
                  </label>
                  <input
                    type="time"
                    id="logoutTime"
                    value={regularizationLogoutTime}
                    onChange={(e) =>
                      setRegularizationLogoutTime(e.target.value)
                    }
                    onClick={(e) =>
                      (e.target as HTMLInputElement).showPicker?.()
                    } // Cast to HTMLInputElement
                    onFocus={(e) =>
                      (e.target as HTMLInputElement).showPicker?.()
                    } // Cast to HTMLInputElement
                    required
                    className="w-full text-sm p-2 outline-none border rounded opacity-65 bg-transparent cursor-pointer"
                  />
                </div>

                {/* Remarks Textarea */}
                <div className="relative">
                  <label
                    htmlFor="remarks"
                    className="absolute bg-[#0B0D29] z-[100] ml-2 text-xs -mt-2 px-1 text-white"
                  >
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
                    <button
                      type="submit"
                      className="w-full bg-[#017A5B] text-white py-2 px-4 rounded"
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

      {/* Register Faces Modal */}
      {/* Register Face Modal */}
      <Dialog.Root
        open={isRegisterFaceModalOpen}
        onOpenChange={setIsRegisterFaceModalOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black opacity-50" />
          <Dialog.Content className="fixed inset-0  z-[100] flex justify-center items-center">
            <div className="bg-[#0B0D29] p-6 rounded-lg max-w-md w-full">
              <div className="flex justify-between">
                <h3 className="text-md ">
                  Register Faces (Upload 3 Images)
                </h3>
                <Dialog.DialogClose>
                  {" "}
                  <CrossCircledIcon className='scale-150  hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]' />

                  {/* <X className="cursor-pointer border -mt-4 rounded-full border-white h-5 hover:bg-white hover:text-black w-5" /> */}
                </Dialog.DialogClose>
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full outline-none text-xs mt-4"
              />

              <div className="grid grid-cols-3 mt-4 gap-4 mb-4">
                {selectedImages?.length > 0 &&
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
                className="bg-[#815BF5] text-sm text-white py-2 px-4 rounded w-full"
              >
                {isLoading ? <Loader /> : "Submit Face Registration"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
