'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { Mail, Phone, PhoneCallIcon, Plus, PlusCircle, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setRole(user.role);
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


    return (
        <div className='p-4'>
            {/* <div className='flex justify-center bg- rounded p-2'>
                <div className="flex cursor-pointer bg-transparent border border-lg  w-full rounded text-sm px-4 py-2 items-center justify-between">
                    <div className="flex items-center text-[#E0E0E0] gap-4">
                        <Avatar>
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback className='bg-[#75517B] text-white'>{firstName.charAt(0)}{lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{firstName} {lastName}</p>
                        </div>
                        <div>
                            <p className="font-medium text-xs">Role: {role === "orgAdmin" ? "Admin" : role === "member" ? "Member" : role === "manager" ? "Manager" : role}</p>
                        </div>
                        <h1>|</h1>
                        <div className='flex text-xs gap-1'>
                            <Mail className='h-4' />
                            <p className="">{email}</p>
                        </div>
                        <h1>|</h1>

                        <p className=" flex gap-2 text-xs"><Phone className='h-4' />{whatsappNo}</p>

                    </div>
                </div>
            </div> */}

            {
                role === "orgAdmin" && (
                    <div>
                        <div className=' mt-4 bg- p-2 bg-[#380E3D] text-lg rounded '>
                            <h1>Organization Details</h1>
                        </div>
                        <div className='  grid grid-cols-1 text- gap-2 py-2'>
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
                                            className='px-4 py-2  border rounded outline-none'
                                            value={organizationName}
                                            onChange={(e: any) => setOrganizationName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={industry}
                                            onChange={(e: any) => setIndustry(e.target.value)}
                                            className="w- mt-2  border rounded px-3 py-2"
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
                                            className="mt-2 border outline-none rounded px-3 py-2"
                                        >
                                            <option value="" disabled>Select Team Size</option>
                                            <option value="1-50">1-50</option>
                                            <option value="51-100">51-100</option>
                                            <option value="101-500">101-500</option>
                                            <option value="501-1000">501-1000</option>
                                            <option value="1000+">1000+</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='mt-2'>
                                    <button
                                        onClick={handleUpdateOrganization}
                                        className="mt-4 px-4 py-2 bg-[#007A5A] hover:bg-[#007A5A] text-white rounded"
                                    >
                                        Update Organization
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
                <h1>Task App Settings</h1>
            </div>
            <Link href='/dashboard/settings/notifications'>
                <div className='mb-2  mt-2 px-4 border rounded py-2'>
                    <h1 className=''>Notifications & Reminders</h1>
                </div>
            </Link>



            {/* 
            <div className='px-4 py-2 cursor-pointer border mt-4 rounded'>
                <h1>Logout</h1>
            </div> */}
        </div >
    );
}
