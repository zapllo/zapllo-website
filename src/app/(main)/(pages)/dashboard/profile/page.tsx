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
    <div className="mt-16">
      <div className="flex justify-center w-full p-2">
        <div className="flex cursor-pointer bg-transparent border border-lg w-fit rounded text-xs px-4 py-2 items-center justify-center">
          <div className="flex items-center text-[#E0E0E0] gap-4">
            {/* Dialog to open Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <div
                  className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-[#75517B]"
                  onClick={() => setIsModalOpen(true)}
                >
                  <IoPersonAddSharp className="h-4 w-4 text-white" />
                </div>
              </DialogTrigger>

              {/* Fullscreen Modal */}
              <DialogContent className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h2 className="text-lg font-bold mb-4">Add New User</h2>
                  <p>This is a modal to add users' data in the application.</p>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="mt-4"
                  >
                    Close
                  </Button>
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
          <div className="border bg-[#380E3D] rounded-lg p-2 mt-2 h-10">
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
          <div className="border bg-[#380E3D] rounded-lg p-2 mt-2 h-10">
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
    </div>
  );
}
