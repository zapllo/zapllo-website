"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogTitle } from "@/components/ui/dialog";
import Loader from "@/components/ui/loader";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoPersonAddSharp } from "react-icons/io5";
import { toast, Toaster } from "sonner";

type Props = {};

interface Category {
  _id: string;
  name: string;
  organization: string;
}

export default function Profile({ }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const router = useRouter();
  const [firstName, setFirstName] = useState("User");
  const [organizationName, setOrganizationName] = useState("");
  const [lastName, setLastName] = useState("User");
  const [role, setRole] = useState("role");
  const [email, setEmail] = useState("email");
  const [whatsappNo, setWhatsAppNo] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<string>('');
  const [userProfile, setUserProfile] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);


  useEffect(() => {
    // Fetch categories from the server
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/category/get');
        const result = await response.json();
        if (response.ok) {
          setCategories(result.data);
        } else {
          console.error('Error fetching categories:', result.error);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    // Fetch the current settings
    axios.get('/api/users/me').then(response => {
      setEmailNotifications(response.data.notifications.email);
      setWhatsappNotifications(response.data.notifications.whatsapp);
    });
  }, []);
  useEffect(() => {
    const getOrganizationDetails = async () => {
      const res = await axios.get('/api/organization/getById');
      const org = res.data.data;
      setOrganizationName(org.companyName);
      setIndustry(org.industry);
      setTeamSize(org.teamSize);
    };
    getOrganizationDetails();
  }, []);
  const handleUpdateOrganization = async () => {
    try {
      const response = await axios.patch('/api/organization/update', {
        companyName: organizationName,
        industry,
        teamSize,
      });
      if (response.status === 200) {
        alert('Organization updated successfully');
      } else {
        alert('Failed to update organization');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('An error occurred while updating the organization');
    }
  };
  useEffect(() => {
    const getUserDetails = async () => {
      const res = await axios.get('/api/users/me');
      const user = res.data.data;
      console.log(user)
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setUserProfile(user.profilePic);
      setRole(user.role);
      setEmail(user.email);
      setWhatsAppNo(user.whatsappNo);
      const trialStatusRes = await axios.get('/api/organization/trial-status');
      setIsTrialExpired(trialStatusRes.data.isExpired);
    };
    getUserDetails();
  }, []);
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        // Fetch trial status
        const response = await axios.get('/api/organization/getById');
        console.log(response.data.data); // Log the organization data
        const organization = response.data.data;
        // Check if the trial has expired
        const isExpired = organization.trialExpires && new Date(organization.trialExpires) <= new Date();
        console.log('isExpired:', isExpired);
        console.log('trialExpires:', organization.trialExpires);
        setIsTrialExpired(isExpired); // Set to true if expired, false otherwise
      } catch (error) {
        console.error('Error fetching user details or trial status:', error);
      }
    }
    getUserDetails();
  }, []);
  if (isTrialExpired) {
    return (
      <div className='p-4 text-center mt-32'>
        <h1 className='text-xl font-bold text-red-500'>Your trial has expired!</h1>
        <p>Please purchase a subscription to continue using the Task Management features.</p>
        <Link href='/dashboard/billing'>
          <Button className='h-10 bg-white text-black hover:text-white mt-4 text-lg '>👑 Upgrade to Pro</Button>
        </Link>
      </div>
    );
  }
  const logout = async () => {
    try {
      await axios.get('/api/users/logout');
      router.push('/login')
    } catch (error: any) {
      console.log(error.message)
    }
  }




  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('files', selectedFile);

    try {
      setLoading(true);

      // Upload the file to S3 using the existing upload endpoint
      const uploadResponse = await axios.post('/api/upload', formData);
      const uploadedImageUrl = uploadResponse.data.fileUrls[0];

      // Update the user's profilePic field in the database
      await axios.patch('/api/users/profilePic', { profilePic: uploadedImageUrl });
      setProfilePic(uploadedImageUrl);
      setLoading(false);
      toast.success("Profile picture updated successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture.");
    }
  };

  console.log(userProfile, 'profile')
  return (
    <div className="mt-16">
      <div className="flex justify-center w-full p-2">
        <div className="flex cursor-pointer bg-transparent border border-lg w-fit rounded text-xs px-4 py-2 items-center justify-center">
          <div className="flex items-center text-[#E0E0E0] gap-4">
            {/* Dialog to open Modal */}
            <Toaster />
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <div
                  className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-[#815BF5]"
                  onClick={() => setIsModalOpen(true)}
                >
                  {userProfile ? (
                    <img src={userProfile} className="w-full h-full border rounded-full" alt="Profile" />
                  ) : (
                    <IoPersonAddSharp className="h-4 w-4 text-white" />
                  )}
                </div>
              </DialogTrigger>

              {/* Fullscreen Modal */}
              <DialogContent className="  flex justify-center items-center z-[100]">
                <div className="bg-[#0b0d29] overflow-y-scroll scrollbar-hide h-fit max-h-[600px]  shadow-lg w-full   max-w-md  rounded-lg">
                  <div className="flex border-b py-2  w-full justify-between ">
                    <DialogTitle className="text-lg   px-6 py-2 font-medium">Update Profile Pic</DialogTitle>
                    <DialogClose className=" px-6 py-2">
                      <CrossCircledIcon className='scale-150 mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]' />
                    </DialogClose>
                  </div>
                  <div className="bg-[#0b0d29] p-8 flex flex-col items-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover mb-4" />
                    ) : (
                      <div className="w-24 h-24 bg- border border-dashed  rounded-full flex items-center justify-center text-gray-400">
                        No Preview
                      </div>
                    )}
                    <label className="text-white bg-[#815BF5] hover:bg-[#815BF5] rounded-lg px-4 py-2 cursor-pointer mt-4">
                      Choose a Picture
                      <input type="file" onChange={handleFileChange} className="hidden" />
                    </label>
                    <div className="flex gap-2 mt-6 w-full">
                      <Button className="bg-[#017a5b] hover:bg-[#018a5b] w-full" onClick={handleUploadProfilePic}>
                        {loading ? <Loader /> : "Update Profile Picture"}
                      </Button>
                      {/* <Button onClick={() => setIsModalOpen(false)}>Cancel</Button> */}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div>
              <p className="font-medium text-sm">
                {firstName} {lastName}
              </p>
            </div>
            <div>
              <p className="font-medium text-xs">
                Role:{" "}
                {role === "orgAdmin"
                  ? "Admin"
                  : role === "member"
                    ? "Member"
                    : role === "manager"
                      ? "Manager"
                      : role}
              </p>
            </div>
            <h1>|</h1>
            <div className="flex text-xs gap-1">
              <Mail className="h-4" />
              <p className="">{email}</p>
            </div>
            <h1>|</h1>

            <p className="flex gap-2 text-xs">
              <Phone className="h-4" />
              {whatsappNo}
            </p>
          </div>
        </div>
      </div>

      {/* Other UI Content */}
      <div className="p-4">
        {/* Account Information */}
        <div>
          <div className="border bg-[#0A0D28] rounded-lg p-2 mt-2 h-10">
            <h1 className="text-sm">My Account Information</h1>
          </div>
          <Link href="/dashboard/settings/changePassword">
            <div className="border-b p-2 mt-2 h-10">
              <h1 className="text-sm">Change Password</h1>
            </div>
          </Link>
        </div>

        {/* Support and Logout */}
        <div className="py-4">
          <div className="border bg-[#0A0D28] rounded-lg p-2 mt-2 h-10">
            <h1 className="text-sm">Support</h1>
          </div>
          <Link href="/help/tutorials">
            <div className="border-b p-2 mt-2 h-10">
              <h1 className="text-sm">Tutorials</h1>
            </div>
          </Link>
          <Link href="/help/tickets">
            <div className="border-b p-2 mt-2 h-10 rounded-lg">
              <h1 className="text-sm">My Tickets</h1>
            </div>
          </Link>
          <Link href="/help/tickets">
            <div className="p-2 mt-2 h-10">
              <h1 className="text-sm">Raise a Ticket</h1>
            </div>
          </Link>
          <div className="flex justify-center">
            <div
              onClick={logout}
              className="border cursor-pointer w-fit bg-red-700 px-8 mt-4 py-2 rounded-lg"
            >
              <h1 className="text-sm">Logout</h1>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
