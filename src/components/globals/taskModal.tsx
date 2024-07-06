'use client'

// Import statements corrected for paths and dependencies
import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    CaretSortIcon,
    CheckIcon
} from "@radix-ui/react-icons";
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { FlagIcon, Repeat } from 'lucide-react';

interface TaskModalProps {
    closeModal: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ closeModal }) => {
    // State variables for form inputs
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [assignedUser, setAssignedUser] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [priority, setPriority] = useState<string>('');
    const [repeat, setRepeat] = useState<boolean>(false);
    const [repeatType, setRepeatType] = useState<string>('');
    const [days, setDays] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<string>('');
    const [attachment, setAttachment] = useState<string>('');
    const [links, setLinks] = useState<string[]>(['']);
    const [users, setUsers] = useState<any[]>([]); // State to store users
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]); // State for filtered users
    const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query
    const [open, setOpen] = useState<boolean>(false); // State for popover open/close
    const [popoverInputValue, setPopoverInputValue] = useState<string>(''); // State for input value in popover

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users/organization');
                const result = await response.json();

                if (response.ok) {
                    setUsers(result.data);
                    setFilteredUsers(result.data); // Initialize filtered users with all users
                } else {
                    console.error('Error fetching users:', result.error);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    // Handle selecting a user from popover
    const handleSelectUser = (selectedUserId: string) => {
        const selectedUser = users.find(user => user._id === selectedUserId);
        if (selectedUser) {
            setAssignedUser(selectedUser._id);
            setPopoverInputValue(selectedUser.firstName); // Set popover input value with user's first name
            setOpen(false);
        }
    };

    // Function to handle link changes
    const handleLinkChange = (index: number, value: string) => {
        const updatedLinks = [...links];
        updatedLinks[index] = value;
        setLinks(updatedLinks);
    };

    // Function to add a link field
    const addLinkField = () => {
        setLinks([...links, '']);
    };

    // Function to remove a link field
    const removeLinkField = (index: number) => {
        const updatedLinks = links.filter((_, i) => i !== index);
        setLinks(updatedLinks);
    };

    // Handle change for days checkboxes
    const handleDaysChange = (day: string) => {
        setDays(prevDays =>
            prevDays.includes(day) ? prevDays.filter(d => d !== day) : [...prevDays, day]
        );
    };

    // Function to handle form submission
    const handleAssignTask = async () => {
        // Implement your logic to assign the task here
        // Send the form data to the server
        const taskData = {
            title,
            description,
            assignedUser,
            categories: [category],
            priority,
            repeat,
            repeatType: repeat ? repeatType : '', // Only include repeatType if repeat is true
            days: repeat ? days : [], // Only include days if repeat is true
            dueDate,
            attachment,
            links,
        };

        try {
            const response = await fetch('/api/tasks/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Task Assigned:', result);
                closeModal();
            } else {
                console.error('Error assigning task:', result.error);
            }
        } catch (error) {
            console.error('Error assigning task:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-black text-white w-[40%] rounded-lg p-8">
                <h2 className="text-lg font-bold mb-4">Create New Task</h2>
                <form className="text-sm">
                    <div className='grid grid-cols-1 gap-4'>
                        <div className="">
                            <Label htmlFor="title" className="block text-white font-semibold">Title</Label>
                            <Input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="description" className="block font-semibold">Description</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2"></Textarea>
                        </div>
                    </div>
                    <div className='grid-cols-2 grid'>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-[200px] justify-between"
                                >
                                    {popoverInputValue ? popoverInputValue : "Select User..."}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search user..." className="h-9" />
                                    <CommandList>
                                        {filteredUsers.length === 0 ? (
                                            <CommandEmpty>No users found.</CommandEmpty>
                                        ) : (
                                            <CommandGroup>
                                                {filteredUsers.map((user) => (
                                                    <CommandItem
                                                        key={user._id}
                                                        value={user._id}
                                                        onSelect={() => handleSelectUser(user._id)}
                                                    >
                                                        {user.firstName}
                                                        {assignedUser === user._id && (
                                                            <CheckIcon className="ml-auto h-4 w-4" />
                                                        )}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <div className="mb-4">
                            {/* <label htmlFor="category" className="block font-semibold">Category</label> */}
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="">Select Category</option>
                                <option value="">Marketing</option>
                                <option value="">Sales</option>
                                <option value="">HR</option>
                                <option value="">Automation</option>

                                {/* Populate options dynamically */}
                            </select>
                        </div>
                    </div>
                    <div className="">
                        <div className="mb-4 bg-gray-900 rounded-md p-2  flex">
                            <div className='flex gap-8'>
                                <label className="gap-2 flex font-semibold"><FlagIcon className='h-5 mt-auto' /> Priority</label>
                                <RadioGroup className='flex ' value={priority} onValueChange={(value) => setPriority(value)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="High" id="r1" />
                                        <Label htmlFor="r1">High</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Medium" id="r2" />
                                        <Label htmlFor="r2">Medium</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Low" id="r3" />
                                        <Label htmlFor="r3">Low</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex justify-between">
                        <div className="flex gap-2 items-center mb-2">
                            <Repeat className='h-4' />
                            <Label htmlFor="repeat" className="font-semibold">Repeat</Label>
                            <input type="checkbox" id="repeat" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="mr-2 h-5" />
                        </div>

                        {repeat && (
                            <div>
                                <div className="mb-4">
                                    {/* <Label htmlFor="repeatType" className="block font-semibold">Repeat Type</Label> */}
                                    <select id="repeatType" value={repeatType} onChange={(e) => setRepeatType(e.target.value)} className="w-full border rounded px-3 py-2">
                                        <option value="">Select Repeat Type</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>


                            </div>
                        )}

                    </div>
                    {repeatType === 'Weekly' && (
                        <div className="mb-4">
                            <Label className="block font-semibold mb-2">Select Days</Label>
                            <div className="grid grid-cols-7 ">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <div key={day} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={day}
                                            value={day}
                                            checked={days.includes(day)}
                                            onChange={() => handleDaysChange(day)}
                                            className="mr-2"
                                        />
                                        <Label htmlFor={day} className="font-semibold">{day.slice(0, 3)}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mb-4">
                        <Label htmlFor="dueDate" className="block font-semibold">Due Date</Label>
                        <Input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded px-3 py-2" />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="attachment" className="block font-semibold">Attachment</Label>
                        <Input type="file" id="attachment" onChange={(e) => setAttachment(e.target.value)} className="w-full border rounded px-3 py-2" />
                    </div>

                    <div className="mb-4">
                        <Label className="block font-semibold mb-2">Links</Label>
                        {links.map((link, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <Input type="text" value={link} onChange={(e) => handleLinkChange(index, e.target.value)} className="w-full border rounded px-3 py-2 mr-2" />
                                <Button type="button" onClick={() => removeLinkField(index)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</Button>
                            </div>
                        ))}
                        <Button type="button" onClick={addLinkField} className="bg-blue-500 text-white px-4 py-2 rounded">Add Link</Button>
                    </div>

                    <div className="flex justify-end">
                        <Button type="button" onClick={handleAssignTask} className="bg-blue-500 text-white px-4 py-2 rounded">Assign Task</Button>
                        <Button type="button" onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded ml-2">Cancel</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
