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
import { Edit, Edit3, FileEdit, Mail, Pencil, Phone, Plus, Trash, Trash2, User, UserCheck } from "lucide-react";
import axios from "axios";
import { Tabs2, TabsList2, TabsTrigger2 } from "../ui/tabs2";
import { Tabs3, TabsList3, TabsTrigger3 } from "../ui/tabs3";
import Loader from "../ui/loader";

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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query





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

  // Filter users based on search query, active tab, and selected reporting manager
  const filteredUsers = users.filter((user) => {
    if (activeTab !== "all" && !user.role.toLowerCase().includes(activeTab.toLowerCase())) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !user.firstName.toLowerCase().includes(query) &&
        !user.lastName.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (selectedReportingManager && user.reportingManager !== selectedReportingManager) {
      return false;
    }
    return true;
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
    setLoading(true);
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

        setLoading(false);
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

      <div className="gap-2 ml-24 mb-6 w-full">
        <div className="flex mt-4 gap-2 mb-4">
          <div>
            <Tabs3 defaultValue={activeTab} onValueChange={setActiveTab} className="w-full justify-start">
              <TabsList3 className="flex gap-4">
                <TabsTrigger3 value="all">All</TabsTrigger3>
                <TabsTrigger3 value="orgAdmin">Admin</TabsTrigger3>
                <TabsTrigger3 value="manager">Manager</TabsTrigger3>
                <TabsTrigger3 value="member">Team Member</TabsTrigger3>
              </TabsList3>
            </Tabs3>
          </div>

          <div className="mt-1 flex">
            <select
              value={selectedReportingManager}
              onChange={handleReportingManagerChange}
              className="block bg-[#29142E] w-full px-3 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">Reporting Manager</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.firstName}</option>
              ))}
            </select>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              {loggedInUserRole === "orgAdmin" && (
                <DialogTrigger asChild>
                  <Button size="sm" className="ml-4 bg-[#29142E] hover:bg-[#29142E] gap-2" onClick={() => setIsModalOpen(true)}>Add Member <Plus /></Button>
                </DialogTrigger>
              )}
              <DialogContent>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Please fill in the details of the new team member.
                </DialogDescription>
                <div className="flex flex-col gap-4">
                  <input
                    placeholder="First Name"
                    className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"

                    value={newMember.firstName}
                    onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                  />
                  <input
                    placeholder="Last Name"
                    className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"

                    value={newMember.lastName}
                    onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                  />
                  <input
                    placeholder="Email"
                    className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"

                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                  <input
                    placeholder="Password"
                    className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"

                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  />
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="block w-full px-2 text-xs py-2 bg-[#292c32]  text-xs border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option className="text-xs" value="member">Team Member</option>
                    <option className="text-xs" value="manager">Manager</option>
                  </select>
                  <div>
                    {newMember.role !== 'orgAdmin' && (
                      <select
                        value={selectedManager}
                        onChange={(e) => setSelectedManager(e.target.value)}
                        className="block w-full px-2 py-2 bg-[#292c32]  text-xs border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option className="text-xs" value="">Select Reporting Manager</option>
                        {users.map(user => (
                          <option className="text-xs" key={user._id} value={user._id}>{user.firstName}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <input
                    placeholder="WhatsApp Number"
                    value={newMember.whatsappNo}
                    className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"
                    onChange={(e) => setNewMember({ ...newMember, whatsappNo: e.target.value })}
                  />
                </div>
                <div className="mt-4 flex justify-end gap-4">
                  <Button variant="outline" className="rounded" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button size="sm" className="bg-[#007A5A] rounded hover:bg-[#007A5A]" onClick={handleCreateUser}>Add Member</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="mb-4 flex ml-56 mt-4">
          <input
            type="text"
            placeholder="Search Team Member"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-1 text-sm px-4 outline-none border rounded bg-[#292C32]"
          />
        </div>
        <div className="grid text-sm w-full py-4 -ml-24 gap-4">
          {filteredUsers
            .filter((user) => {
              if (activeTab === "all") return true;
              return user.role.toLowerCase().includes(activeTab.toLowerCase());
            })
            .map((user) => (
              <div key={user._id}>
                <Card key={user.firstName} className="flex rounded bg-[#201024] cursor-pointer items-center justify-between w-full p-2">
                  <div className="items-center flex gap-4">
                    <div className="flex gap-2">
                      <Avatar className="scale-75">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback className="bg-[#75517B]">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium w-[100px] mt-2 text-sm">
                          {user.firstName.length > 8 ? `${user.firstName.slice(0, 8)}...` : user.firstName}
                        </p>
                      </div>

                    </div>
                    <Mail className="h-5" />
                    <p className="text-[#E0E0E0]">{user.email}</p>
                    <h1 className="text-[#E0E0E066]">|</h1>
                    <div className="flex gap-2 mt-1">
                      <Phone className="h-5" />
                      <p className="text-[#E0E0E0]">{user.whatsappNo}</p>
                    </div>
                    <h1 className="text-[#E0E0E066]">|</h1>
                    {reportingManagerNames[user._id] && (
                      <div className="flex">
                        <UserCheck className="h-5" />
                        <p className="text-[#E0E0E0]">{reportingManagerNames[user._id]}</p>
                      </div>
                    )}
                  </div>

                  <div className="justify-end w-full flex">
                    <div
                      className={`w-fit px-4 py-1 rounded text-xs ${user.role === 'orgAdmin' ? 'bg-[#B4173B]' : user.role === 'manager' ? 'bg-orange-500' : user.role === 'member' ? 'bg-[#007A5A]' : 'bg-gray-500'}`}
                    >
                      {user.role === "orgAdmin" ? "Admin" : user.role === "member" ? "Member" : user.role === "manager" ? "Manager" : user.role}
                    </div>
                  </div>




                  <div className="flex">
                    <Button className="bg-transparent  hover:bg-transparent" onClick={() => {
                      setEditedUser({
                        _id: user._id,
                        email: user.email,
                        role: user.role,
                        password: "",
                        firstName: user.firstName,
                        lastName: user.lastName,
                        whatsappNo: user.whatsappNo,
                        reportingManager: selectedManager,
                      });
                      setIsEditModalOpen(true);
                    }}>
                      <Pencil className="h-5 text-blue-500" />
                    </Button>
                    <Button className="bg-transparent hover:bg-transparent" onClick={() => handleDeleteUser(user._id)}>
                      <Trash2 className="text-[#9C2121] h-5" />
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Modify the details of the selected user.
          </DialogDescription>
          <div className="flex flex-col gap-4">
            <input
              placeholder="First Name"
              value={editedUser.firstName}
              className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"
              onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
            />
            <input
              placeholder="Last Name"
              value={editedUser.lastName}
              className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"
              onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
            />
            <input
              placeholder="Email"
              value={editedUser.email}
              className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
            />
            <input
              placeholder="Password"
              value={editedUser.password}
              className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"
              onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })}
            />
            <select
              value={editedUser.role}
              onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
              className="block w-full px-2 py-2 bg-[#292c32]  text-xs border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="member" className="text-xs">Team Member</option>
              <option value="orgAdmin" className="text-xs">Admin</option>
              <option value="manager" className="text-xs">Manager</option>
            </select>
            <input
              placeholder="WhatsApp Number"
              value={editedUser.whatsappNo}
              className="py-2 px-2 text-xs bg-[#292c32] rounded outline-none"
              onChange={(e) => setEditedUser({ ...editedUser, whatsappNo: e.target.value })}
            />
          </div>
          <div className="mt-4 flex justify-end gap-4">
            <Button variant="outline" className="rounded" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-[#007A5A] hover:bg-[#007A5A] rounded" onClick={handleEditUser}>
              {loading ? (
                <>
                  <Loader className="inline-block mr-2" />
                  Saving Changes
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
}
