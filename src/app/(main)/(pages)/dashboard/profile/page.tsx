"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import axios from "axios";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoPersonAddSharp } from "react-icons/io5";

type Props = {};

interface Category {
  _id: string;
  name: string;
  organization: string;
}

export default function Profile({}: Props) {
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

  // Other useEffect hooks and logic ...

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      router.push("/login");
    } catch (error: any) {
      console.log(error.message);
    }
  };

    return (
        <div className='mt-16'>
            <div className='flex justify-center w-full bg- rounded p-2'>
                <div className="flex  cursor-pointer bg-transparent border border-lg  w-fit rounded text-xs px-4 py-2 items-center justify-center">
                    <div className="flex items-center text-[#E0E0E0] gap-4">
                        <Avatar>
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback className='bg-[#815BF5] text-white'>{firstName.charAt(0)}{lastName.charAt(0)}</AvatarFallback>
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

            <p className="flex gap-2 text-xs">
              <Phone className="h-4" />
              {whatsappNo}
            </p>
          </div>
        </div>
      </div>


            </div>
            <div className='p-4 '>
                <div>
                    <div className='border bg-[#0A0D28] rounded-lg p-2 mt-2 h-10 '>
                        <h1 className='text-sm'>My Account Information</h1>
                    </div>
                    <Link href='/dashboard/settings/changePassword'>
                        <div className='border-b p-2 mt-2 h-10 '>
                            <h1 className='text-sm'>Change Password</h1>
                        </div>
                    </Link>
                </div>
                <div className='py-4'>
                    <div className='border bg-[#0A0D28] rounded-lg p-2 mt-2 h-10 '>
                        <h1 className='text-sm'>Support</h1>
                    </div>
                    <Link href='/help/tutorials'>
                        <div className='border-b p-2 mt-2 h-10 '>
                            <h1 className='text-sm'>Tutorials</h1>
                        </div>
                    </Link>
                    <Link href='/help/tickets'>
                        <div className='border-b p-2 mt-2 h-10 rounded-lg'>
                            <h1 className='text-sm'>My Tickets</h1>
                        </div>
                    </Link>
                    <Link href='/help/tickets'>
                        <div className=' p-2 mt-2 h-10 '>
                            <h1 className='text-sm'>Raise a Ticket</h1>
                        </div>
                    </Link>
                    <div className='flex justify-center '>
                        <div onClick={logout} className='border cursor-pointer w-fit  bg-red-700 px-8 mt-4 py-2  rounded-lg'>
                            <h1 className='text-sm'>Logout</h1>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}
