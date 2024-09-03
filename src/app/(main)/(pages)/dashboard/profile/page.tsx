'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'


type Props = {}

interface Category {
    _id: string;
    name: string;
    organization: string;
}


export default function Profile({ }: Props) {
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


    return (
        <div className='mt-16'>
            <div className='flex justify-center w-full bg- rounded p-2'>
                <div className="flex  cursor-pointer bg-transparent border border-lg  w-fit rounded text-xs px-4 py-2 items-center justify-center">
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


            </div>
            <div className='p-4 '>
                <div>
                    <div className='border bg-[#380E3D] rounded-lg p-2 mt-2 h-10 '>
                        <h1 className='text-sm'>My Account Information</h1>
                    </div>
                    <Link href='/dashboard/settings/changePassword'>
                        <div className='border-b p-2 mt-2 h-10 '>
                            <h1 className='text-sm'>Change Password</h1>
                        </div>
                    </Link>
                </div>
                <div className='py-4'>
                    <div className='border bg-[#380E3D] rounded-lg p-2 mt-2 h-10 '>
                        <h1 className='text-sm'>Support</h1>
                    </div>
                    <Link href='/dashboard/tutorials'>
                        <div className='border-b p-2 mt-2 h-10 '>
                            <h1 className='text-sm'>Tutorials</h1>
                        </div>
                    </Link>
                    <Link href='/dashboard/tickets'>
                        <div className='border-b p-2 mt-2 h-10 rounded-lg'>
                            <h1 className='text-sm'>My Tickets</h1>
                        </div>
                    </Link>
                    <Link href='/dashboard/tickets'>
                        <div className=' p-2 mt-2 h-10 '>
                            <h1 className='text-sm'>Raise a Ticket</h1>
                        </div>
                    </Link>
                    <div className='flex justify-center '>
                        <div onClick={logout} className='border cursor-pointer w-fit  px-8 mt-4 py-2  rounded-lg'>
                            <h1 className='text-sm'>Logout</h1>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}