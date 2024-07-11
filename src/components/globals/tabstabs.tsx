"use client";

import { useEffect, useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function TeamTabs() {
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    email: "",
    role: "Team Member",
    password: "",
    firstName: "",
    lastName: "",
    whatsappNo: "",
  });
  const [users, setUsers] = useState([]);

  const handleAddMember = async () => {
    const response = await fetch("/api/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMember),
    });

    const data = await response.json();

    if (data.success) {
      // Reset the new member form
      setNewMember({
        firstName: "",
        email: "",
        role: "Team Member",
        password: "",
        lastName: "",
        whatsappNo: "",
      });
      setIsModalOpen(false);
      // Optionally, you can add the new member to the users array here if you want to update the UI
      // setUsers((prevUsers) => [...prevUsers, data.user]);
    } else {
      // Handle error
      alert(data.error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/organization");
        const result = await response.json();

        if (response.ok) {
          setUsers(result.data);
        } else {
          console.error("Error fetching users:", result.error);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex gap-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="orgAdmin">Admin</TabsTrigger>
            <TabsTrigger value="manager">Manager</TabsTrigger>
            <TabsTrigger value="member">Team Member</TabsTrigger>
          </TabsList>
        </Tabs>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-4" onClick={() => setIsModalOpen(true)}>Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Please fill in the details of the new team member.
            </DialogDescription>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="First Name"
                value={newMember.firstName}
                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
              />
              <Input
                placeholder="Last Name"
                value={newMember.lastName}
                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
              <Input
                placeholder="Password"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
              />
              <Input
                placeholder="Role"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              />
              <Input
                placeholder="WhatsApp Number"
                value={newMember.whatsappNo}
                onChange={(e) => setNewMember({ ...newMember, whatsappNo: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMember}>Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* <div className="grid text-sm gap-4">
        {users
          .filter((user) => {
            if (activeTab === "all") return true;
            return user.role.toLowerCase().includes(activeTab.toLowerCase());
          })
          .map((user) => (
            <Card key={user.firstName} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.firstName}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge variant={user.role.toLowerCase() === "orgAdmin" ? "destructive" : "outline"}>{user.role}</Badge>
            </Card>
          ))}
      </div> */}
    </div>
  );
}
