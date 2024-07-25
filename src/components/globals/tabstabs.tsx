'use client'

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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Phone, User, UserCheck } from "lucide-react";
import axios from "axios";

interface User {
  _id: string;
  email: string;
  role: string;
  password: string;
  firstName: string;
  lastName: string;
  whatsappNo: string;
  reportingManager: string;
}

interface APIResponse<T> {
  success: boolean;
  user: T;
  error?: string;
}

export default function TeamTabs() {
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    email: "",
    role: "member",
    password: "",
    firstName: "",
    lastName: "",
    whatsappNo: "",
    reportingManager: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loggedInUserRole, setLoggedInUserRole] = useState("");
  const [editedUser, setEditedUser] = useState<User>({
    _id: "",
    email: "",
    role: "",
    password: "",
    firstName: "",
    lastName: "",
    whatsappNo: "",
    reportingManager: "",
  });
  const [selectedManager, setSelectedManager] = useState('');
  const [reportingManagerName, setReportingManagerName] = useState('');
  const [reportingManagerNames, setReportingManagerNames] = useState<{ [key: string]: string }>({});
  const [selectedReportingManager, setSelectedReportingManager] = useState("");

  useEffect(() => {
    // Update newMember's reportingManagerId when selectedManager changes
    setNewMember(prevState => ({
      ...prevState,
      reportingManagerId: selectedManager
    }));
  }, [selectedManager]);


  const fetchReportingManagerNames = async (users: User[]): Promise<{ [key: string]: string }> => {
    const managerNames: { [key: string]: string } = {};

    for (const user of users) {
      if (user.reportingManager) {
        try {
          const response = await axios.get(`/api/users/${user.reportingManager}`);
          const { data } = response.data;
          managerNames[user._id] = `${data.firstName}`;
        } catch (error: any) {
          console.error(`Error fetching reporting manager for user ${user._id}:`, error);
        }
      }
    }

    return managerNames;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/organization");
        const result = await response.json();

        if (response.ok) {
          setUsers(result.data);
          const managerNames = await fetchReportingManagerNames(result.data);
          setReportingManagerNames(managerNames);
        } else {
          console.error("Error fetching users:", result.error);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const getUserDetails = async () => {
      const res = await axios.get('/api/users/me')
      setLoggedInUserRole(res.data.data.role);
    }
    getUserDetails();
  }, []);

  const handleReportingManagerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReportingManager(event.target.value);
  };

  const filteredUsers = users.filter((user) => {
    if (!selectedReportingManager) return true;
    return user.reportingManager === selectedReportingManager;
  });



  const handleCreateUser = async () => {
    try {
      const response = await axios.post('/api/users/signup', newMember);

      const data: APIResponse<User> = response.data;

      if (data.success) {
        // Add the new user to the list
        setUsers([...users, data.user]);
        // Close the modal
        setIsModalOpen(false);
        // Clear the new member form
        setNewMember({
          email: "",
          role: "member",
          password: "",
          firstName: "",
          lastName: "",
          whatsappNo: "",
          reportingManager: '',
        });
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user. Please try again.");
    }
  };


  const handleEditUser = async () => {
    try {
      const response = await fetch(`/api/users/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUser),
      });

      const data: APIResponse<User> = await response.json();

      if (data.success) {
        // Update user details in the UI
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === editedUser._id ? data.user : user
          )
        );
        if (selectedUser && selectedUser._id === editedUser._id) {
          setSelectedUser(data.user);
        }


        setIsEditModalOpen(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error editing user:", error);
      alert("Error editing user. Please try again.");
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`/api/users/update`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIdToDelete: selectedUser?._id }),
      });

      const data: APIResponse<void> = await response.json();

      if (data.success) {
        // Remove deleted user from the UI
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== selectedUser?._id)
        );
        setSelectedUser(null); // Clear selected user state
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
    }
  };


  // useEffect(() => {
  //   if (selectedUser) {
  //     fetchReportingManagerName(selectedUser.reportingManager);
  //   }
  // }, [selectedUser]);
  return (
    <div className="w-full max-w-4xl mx-auto">

      <div className="flex items-center gap-2 justify-between mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex gap-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="orgAdmin">Admin</TabsTrigger>
            <TabsTrigger value="manager">Manager</TabsTrigger>
            <TabsTrigger value="member">Team Member</TabsTrigger>
          </TabsList>

        </Tabs>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          {loggedInUserRole === "orgAdmin" && (
            <DialogTrigger asChild>
              <Button size="sm" className="ml-4" onClick={() => setIsModalOpen(true)}>Add Member</Button>
            </DialogTrigger>
          )}
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
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="member">Team Member</option>
                <option value="manager">Manager</option>
              </select>
              <div>
                {newMember.role !== 'orgAdmin' && (
                  <select
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select Reporting Manager</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.firstName}</option>
                    ))}
                  </select>
                )}
              </div>
              <Input
                placeholder="WhatsApp Number"
                value={newMember.whatsappNo}
                onChange={(e) => setNewMember({ ...newMember, whatsappNo: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button size="sm" className="ml-4" onClick={handleCreateUser}>Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="mt-1">

          <select
            value={selectedReportingManager}
            onChange={handleReportingManagerChange}
            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="">Select Reporting Manager</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.firstName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid text-sm gap-4">
        {filteredUsers
          .filter((user) => {
            if (activeTab === "all") return true;
            return user.role.toLowerCase().includes(activeTab.toLowerCase());
          })
          .map((user) => (
            <div key={user._id}>
              <Card key={user.firstName} onClick={() => setSelectedUser(user)} className="flex cursor-pointer items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.firstName}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex">
                    <Phone className="h-4 mt-6" />
                    <p className="text-muted-foreground mt-6">{user.whatsappNo}</p>
                  </div>
                  <div className="flex items-center">
                    <UserCheck className="h-4 mt-6" />
                    <p className="text-muted-foreground mt-6"> {reportingManagerNames[user._id]}</p>
                  </div>

                </div>
                <Badge variant={user?.role.toLowerCase() === "orgadmin" ? "destructive" : "outline"}>
                  {user.role === "orgAdmin" ? "Admin" : user.role === "member" ? "Member" : user.role === "manager" ? "Manager" : user.role}
                </Badge>
              </Card>
              {selectedUser && selectedUser._id === user._id && (
                <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                  <SheetContent className="max-w-4xl w-full">
                    <SheetHeader>
                      <SheetTitle className="text-muted-foreground">
                        <div className="flex gap-2">
                          <User />  User details
                        </div>
                      </SheetTitle>
                      {loggedInUserRole === "orgAdmin" && (
                        <div className="flex gap-2 p-4  ml-auto ">
                          <Button variant="secondary" onClick={() => {
                            setEditedUser({
                              _id: selectedUser._id,
                              email: selectedUser.email,
                              role: selectedUser.role,
                              password: "",
                              firstName: selectedUser.firstName,
                              lastName: selectedUser.lastName,
                              whatsappNo: selectedUser.whatsappNo,
                              reportingManager: selectedManager,
                            });
                            setIsEditModalOpen(true);
                          }}>Edit</Button>
                          <Button className="bg-red-600" onClick={handleDeleteUser}>Delete</Button>
                        </div>
                      )}
                      <div className="shadow-sm  shadow-white rounded-xl p-4">
                        <SheetDescription className="  text-md text-white">
                          <div className="space-y-2">
                            <h1>
                              Full Name: {selectedUser.firstName}{' '} {selectedUser.lastName}

                            </h1>
                            <h1>
                              Email: {selectedUser.email}
                            </h1>
                            <h1>
                              WhatsApp Number: {selectedUser.whatsappNo}
                            </h1>
                            <h1>
                              Role: {selectedUser.role}
                            </h1>
                            <h1>
                              Reporting Manager: {reportingManagerNames[user._id]}
                            </h1>
                          </div>
                        </SheetDescription>
                      </div>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              )}

            </div>
          ))}

      </div>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Modify the details of the selected user.
          </DialogDescription>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="First Name"
              value={editedUser.firstName}
              onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
            />
            <Input
              placeholder="Last Name"
              value={editedUser.lastName}
              onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
            />
            <Input
              placeholder="Password"
              value={editedUser.password}
              onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })}
            />
            <select
              value={editedUser.role}
              onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
              className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="member">Team Member</option>
              <option value="orgAdmin">Admin</option>
              <option value="manager">Manager</option>
            </select>
            <Input
              placeholder="WhatsApp Number"
              value={editedUser.whatsappNo}
              onChange={(e) => setEditedUser({ ...editedUser, whatsappNo: e.target.value })}
            />
          </div>
          <div className="mt-4 flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
