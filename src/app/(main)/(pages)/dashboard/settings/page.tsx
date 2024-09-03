'use client';

import CustomTimePicker from '@/components/globals/time-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Loader from '@/components/ui/loader';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { DialogClose } from '@radix-ui/react-dialog';
import { StopwatchIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import { Mail, Phone, PhoneCallIcon, Plus, PlusCircle, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

interface Category {
    _id: string;
    name: string;
    organization: string;
}

export default function Page() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
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
    const [whatsappReminders, setWhatsappReminders] = useState(true);
    const [emailReminders, setEmailReminders] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dueTime, setDueTime] = useState<string>('');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

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

    const handleCreateCategory = async () => {
        if (!newCategory) return;
        try {
            const response = await fetch('/api/category/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newCategory }),
            });

            const result = await response.json();

            if (response.ok) {
                // Add the new category to the categories list
                setCategories([...categories, result.data]);
                // Clear the new category input
                setNewCategory('');
            } else {
                console.error('Error creating category:', result.error);
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };





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
            setLoading(true);
            const response = await axios.patch('/api/organization/update', {
                companyName: organizationName,
                industry,
                teamSize,
            });

            if (response.status === 200) {
                toast.success('Organization updated successfully');
                setLoading(false);
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
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setLoading(true);
            setRole(user.role);
            setLoading(false);
            setEmail(user.email);
            setWhatsAppNo(user.whatsappNo);
            const trialStatusRes = await axios.get('/api/organization/trial-status');
            setIsTrialExpired(trialStatusRes.data.isExpired);
        };
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


    const handleCheckboxChange = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className='p-4 '>
            <Toaster />

            {
                role === "orgAdmin" && (
                    <div>
                        {loading ? <Loader /> : ""}
                        <div className=' mt-2 bg- p-2 bg-[#380E3D] text-lg rounded '>
                            <h1 className='text-sm'>Organization Details</h1>
                        </div>
                        <div className=' text-xs grid grid-cols-1 text- gap-2 py-2'>
                            <div className='grid-cols-2 grid gap-2 p-2'>
                                <div className=''>
                                    <h1 className='mt-2'>Company Name</h1>
                                    <h1 className='mt-6'>Industry</h1>
                                    <h1 className='mt-8'>Team Size</h1>
                                </div>
                                <div className=''>
                                    <div>
                                        <input
                                            type='text'
                                            className='px-4 py-2 w-full bg-[#1A1C20]  border rounded outline-none'
                                            value={organizationName}
                                            onChange={(e: any) => setOrganizationName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={industry}
                                            onChange={(e: any) => setIndustry(e.target.value)}
                                            className="w- mt-2 w-full outline-none bg-[#1A1C20] border rounded px-3 py-2"
                                        >
                                            <option value="" disabled>Select Industry</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Technology">Technology</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Education">Education</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={teamSize}
                                            onChange={(e: any) => setTeamSize(e.target.value)}
                                            className="mt-2 border bg-[#1A1C20] outline-none w-full  rounded px-3 py-2"
                                        >
                                            <option value="" disabled>Select Team Size</option>
                                            <option value="1-5">1-5</option>
                                            <option value="5-10">5-10</option>
                                            <option value="10-15">10-15</option>
                                            <option value="15-20">15-20</option>
                                            <option value="20-25">20-25</option>
                                            <option value="25+">25+</option>
                                        </select>
                                    </div>

                                </div>
                                <div className='mt-2'>
                                    <button
                                        onClick={handleUpdateOrganization}
                                        className="mt-4 px-4 py-2 ml-auto bg-[#007A5A] hover:bg-[#007A5A] text-white rounded"
                                    >
                                        {loading ? <Loader /> : "Update Organization "}
                                    </button>
                                </div>
                            </div>



                            <div className='flex gap-2'>


                            </div>
                            <div className='flex gap-2'>


                            </div>

                        </div>
                    </div>
                )
            }
            {/* <h1 className='p-4 text-xl font-medium'>My Account Information</h1>
            <Link href='/dashboard/settings/changePassword'>
                <div className='px-4 border py-2 flex -ml-4'>
                    <img src='/icons/eyes.png' className='h-9 ml-3' />
                    <h1 className='ml-4 mt-1'>Change Password</h1>
                </div>
            </Link>
            <h1 className='p-4 text-xl font-medium'>Support</h1>
            <Link href='/dashboard/settings/Tutorials'>
                <div className='px-4 border py-2 flex -ml-4'>
                    <img src='/icons/video.png' className='h-9 ml-3' />
                    <h1 className='ml-4 mt-1'>Tutorials</h1>
                </div>
            </Link>
            <Link href='/dashboard/settings/myTickets'>
                <div className='px-4 border py-2 flex -ml-4'>
                    <img src='/icons/ticket.png' className='h-9 ml-3' />
                    <h1 className='ml-4 mt-1'>My Tickets</h1>
                </div>
            </Link>
            <Link href='/dashboard/settings/RaiseTicket'>
                <div className='px-4 border py-2 flex -ml-4'>
                    <PlusCircle className='ml-4 '/>
                    <h1 className='ml-4 mt-1'>Raise a Ticket</h1>
                </div>
            </Link> */}
            <div className=' mt-4 bg-[#380E3D] p-2 border rounded '>
                <h1 className='text-sm'>Task App Settings</h1>
            </div>
            <Dialog>
                <DialogTrigger>
                    <div className='mb-2 bg-[#75517B]  mt-2 px-4 w-full m border rounded py-2'>
                        <h1 className=' text-xs w-full'>Notifications & Reminders</h1>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <div className="settings-container   shadow-md rounded-md">
                        <div className='flex justify-between w-full mb-4'>
                            <h1 className="text-lg font-bold ">Notifications</h1>
                            <DialogClose>X</DialogClose>
                        </div>

                        <div className="mb-4 flex justify-between">
                            <span className="ml-2">Email Notifications</span>

                            <Switch
                                checked={emailNotifications}
                                onCheckedChange={(checked) => setEmailNotifications(checked)}
                                className="form-checkbox  text-white"
                            />


                        </div>
                        <div className="mb-4 flex justify-between">
                            <span className="ml-2">WhatsApp Notifications</span>

                            <Switch
                                checked={whatsappNotifications}
                                onCheckedChange={(checked) => setWhatsappNotifications(checked)}
                                className="form-checkbox  text-white"
                            />

                        </div>
                        <Separator />
                        <h1 className="text-lg font-bold mb-4 mt-2">Reminders</h1>
                        <div>
                            <div className='flex justify-between'>
                                <div>
                                    <h1 className='ml-2'>Daily Reminder Time</h1>
                                    <p className='ml-4 mb-4 text-xs'>Please Select Time</p>
                                </div>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger>
                                        <Avatar
                                            className='bg-[#017A5B] h-7 items-center cursor-pointer flex w-7'
                                            onClick={() => setIsDialogOpen(true)}
                                        >
                                            <StopwatchIcon className='h-6 w-5 ml-1' />
                                        </Avatar>
                                    </DialogTrigger>
                                    <DialogContent className='h-fit w-fit'>
                                        <div className='flex justify-between w-full'>
                                            <h1 className=''>Set Reminder Time</h1>
                                            <DialogClose>X</DialogClose>
                                        </div>
                                        <CustomTimePicker onTimeChange={setDueTime} selectedTime={dueTime} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="mb-4 mt-2 flex justify-between">
                                <span className="ml-2">Email Reminders</span>

                                <Switch
                                    checked={emailReminders}
                                    onCheckedChange={(checked) => setEmailReminders(checked)}
                                    className="form-checkbox  text-white"
                                />


                            </div>
                            <div className="mb-4 mt-2 flex justify-between">
                                <span className="ml-2">WhatsApp Reminders</span>

                                <Switch
                                    checked={whatsappReminders}
                                    onCheckedChange={(checked) => setWhatsappReminders(checked)}
                                    className="form-checkbox  text-white"
                                />


                            </div>
                        </div>
                        <Separator />
                        <div>
                            <h1>Weekly Offs</h1>
                            <div className='grid grid-cols-7 p-4 gap-2'>
                                {daysOfWeek.map(day => (
                                    <label key={day} className='flex items-center'>
                                        <input
                                            type="checkbox"
                                            checked={selectedDays.includes(day)}
                                            onChange={() => handleCheckboxChange(day)}
                                            className="mr-2"
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className='flex justify-end mt-2 w-full'>
                            <button
                                onClick={updateSettings}
                                className="px-4 py-2  bg-[#017A5B] hover:bg-[#017A5B]  text-white rounded-md  transition"
                            >
                                Save Settings
                            </button>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>




            {/* 
            <div className='px-4 py-2 cursor-pointer border mt-4 rounded'>
                <h1>Logout</h1>
            </div> */}
        </div >
    );
}
