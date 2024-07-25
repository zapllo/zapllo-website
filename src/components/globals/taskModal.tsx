'use client'

// Import statements corrected for paths and dependencies
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
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
    CaretDownIcon,
    CaretSortIcon,
    CheckIcon
} from "@radix-ui/react-icons";
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { CalendarIcon, ClipboardIcon, Clock, FlagIcon, Link, Mic, Paperclip, Repeat } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { format } from 'date-fns';
import CustomDatePicker from './date-picker';
import CustomTimePicker from './time-picker';
import { Separator } from '../ui/separator';
import axios from 'axios';


interface TaskModalProps {
    closeModal: () => void;
}

interface Category {
    _id: string;
    name: string;
    organization: string;
}


const TaskModal: React.FC<TaskModalProps> = ({ closeModal }) => {
    // State variables for form inputs
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [assignedUser, setAssignedUser] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [priority, setPriority] = useState<string>('High');
    const [repeat, setRepeat] = useState<boolean>(false);
    const [repeatType, setRepeatType] = useState<string>('');
    const [days, setDays] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [dueTime, setDueTime] = useState<string>('');
    const [attachment, setAttachment] = useState<string>('');
    const [links, setLinks] = useState<string[]>(['']);
    const [users, setUsers] = useState<any[]>([]); // State to store users
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]); // State for filtered users
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]); // State for filtered users
    const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query
    const [searchCategoryQuery, setSearchCategoryQuery] = useState<string>(''); // State for search query
    const [searchDateQuery, setSearchDateQuery] = useState<string>(''); // State for search query
    const [open, setOpen] = useState<boolean>(false); // State for popover open/close
    const [categoryOpen, setCategoryOpen] = useState<boolean>(false); // State for popover open/close
    const [popoverInputValue, setPopoverInputValue] = useState<string>(''); // State for input value in popover
    const [popoverCategoryInputValue, setPopoverCategoryInputValue] = useState<string>(''); // State for input value in popover
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(true);
    const [date, setDate] = React.useState<Date>();
    const [repeatMonthlyDay, setRepeatMonthlyDay] = useState(""); // New state for monthly day
    const [repeatMonthlyDays, setRepeatMonthlyDays] = useState<number[]>([]);
    const [assignMoreTasks, setAssignMoreTasks] = useState(false); // State for switch
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioURLRef = useRef<string | null>(null);
    const [role, setRole] = useState("");

    const handleSwitchChange = (event: any) => {
        setAssignMoreTasks(event.target.checked);

        // Clear fields when switch is toggled
        if (event.target.checked) {
            setTitle("");
            setDescription("");
            setAssignedUser("");
            setCategory("");
            setPriority("");
            setRepeat(false);
            setRepeatType("");
            setDays([]);
            setDueDate(null);
            setDueTime("");
            setAttachment("");
            setLinks([]);
            setDueDate(null);
            setDueTime('');
        }
    };
    useEffect(() => {
        const getUserDetails = async () => {
            const res = await axios.get('/api/users/me');
            const user = res.data.data;
            setRole(user.role);
        };
        getUserDetails();
    }, []);


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

    // Filter users based on search query
    useEffect(() => {
        if (searchCategoryQuery.trim() === '') {
            setFilteredCategories(categories);
        } else {
            const filtered = categories.filter(category =>
                category.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCategories(filtered);
        }
    }, [searchCategoryQuery, categories]);

    // Handle selecting a user from popover
    const handleSelectUser = (selectedUserId: string) => {
        const selectedUser = users.find(user => user._id === selectedUserId);
        if (selectedUser) {
            setAssignedUser(selectedUser._id);
            setPopoverInputValue(selectedUser.firstName); // Set popover input value with user's first name
            setOpen(false);
        }
    };

    const handleSelectCategory = (selectedCategoryId: string) => {
        const selectedCategory = categories.find(category => category._id === selectedCategoryId);
        if (selectedCategory) {
            setCategory(selectedCategory._id);
            setPopoverCategoryInputValue(selectedCategory.name); // Set popover input value with user's first name
            setCategoryOpen(false);
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
        setDays(prevDays => {
            if (prevDays.includes(day)) {
                return prevDays.filter(d => d !== day);
            } else {
                return [...prevDays, day];
            }
        });
    };

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
                // Switch back to selection mode
                setCreatingCategory(false);
                // Set the newly created category as selected
                setCategory(result.data._id);
            } else {
                console.error('Error creating category:', result.error);
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };


    const handleAssignTask = async () => {
        if (!dueDate || !dueTime) {
            alert('Due date and time are required.');
            return; // Stop execution if validation fails
        }
        const taskData = {
            title,
            description,
            assignedUser,
            category,
            priority,
            repeat,
            repeatType: repeat ? repeatType : '', // Only include repeatType if repeat is true
            days: repeat ? days : [], // Only include days if repeat is true
            dates: repeatMonthlyDays,
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

                if (assignMoreTasks) {
                    // Clear fields when "Assign More Tasks" is checked
                    setTitle("");
                    setDescription("");
                    setAssignedUser("");
                    setCategory("");
                    setPriority("");
                    setRepeat(false);
                    setRepeatType("");
                    setDays([]);
                    setDueDate(null);
                    setDueTime("");
                    setAttachment("");
                    setLinks([]);
                } else {
                    closeModal();
                }
            } else {
                console.error('Error assigning task:', result.error);
            }
        } catch (error) {
            console.error('Error assigning task:', error);
        }
    };


    // const [open, setOpen] = useState(false);
    // const [searchQuery, setSearchQuery] = useState('');
    // const [popoverInputValue, setPopoverInputValue] = useState('');

    const handleOpen = () => setOpen(true);
    const handleCategoryOpen = () => setCategoryOpen(true);

    const handleClose = (selectedValue: any) => {
        setPopoverInputValue(selectedValue);
        setOpen(false);
    };

    const handleCategoryClose = (selectedValue: any) => {
        setPopoverCategoryInputValue(selectedValue);
        setCategoryOpen(false);
    };

    const handleCheckboxChange = (event: any) => {
        const checked = event.target.checked;
        setAssignMoreTasks(checked);
    };


    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            setRecording(true);

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    const blob = new Blob([event.data], { type: 'audio/wav' });
                    setAudioBlob(blob);
                    const audioURL = URL.createObjectURL(blob);
                    audioURLRef.current = audioURL; // Assign audioURL to audioURLRef.current
                }
            };

            mediaRecorder.onstop = () => {
                setRecording(false);
            };

            mediaRecorderRef.current = mediaRecorder; // Correctly assign the MediaRecorder instance to the ref
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
    };


    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 rounded-xl flex justify-center items-center">
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
                    <div className='grid-cols-2 gap-4 grid'>
                        <div>
                            <button
                                type="button"
                                className="p-2 flex justify-between w-full text-start border rounded"
                                onClick={handleOpen}
                            >
                                {popoverInputValue ? popoverInputValue : "Select User"}
                                <CaretDownIcon />
                            </button>
                        </div>

                        {open && (
                            <UserSelectPopup
                                users={users}
                                assignedUser={assignedUser}
                                setAssignedUser={setAssignedUser}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                onClose={handleClose}
                            />
                        )}

                        <div className="mb-4">
                            {/* <label htmlFor="category" className="block font-semibold">Category</label> */}

                            {/* <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}


                                <Input
                                    type="text"
                                    placeholder="New Category"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full bg-white border rounded px-3 py-2"
                                />
                                <button
                                    onClick={handleCreateCategory}
                                    className="ml-2 px-3 py-2 bg-blue-500 text-white rounded"
                                >
                                    Create
                                </button>

                            </select> */}
                            <div>
                                <button
                                    type="button"
                                    className="p-2 flex justify-between w-full text-start border rounded"
                                    onClick={handleCategoryOpen}
                                >
                                    {popoverCategoryInputValue ? popoverCategoryInputValue : "Select Category"}
                                    <CaretDownIcon />
                                </button>
                            </div>
                            {categoryOpen && (
                                <CategorySelectPopup
                                    categories={categories}
                                    category={category}
                                    setCategory={setCategory}
                                    newCategory={newCategory}
                                    setCategories={setCategories}
                                    setNewCategory={setNewCategory}
                                    searchCategoryQuery={searchCategoryQuery}
                                    setSearchCategoryQuery={setSearchCategoryQuery}
                                    onClose={handleCategoryClose}
                                    role={role}
                                />
                            )}


                        </div>
                    </div>
                    <div className="">
                        <div className="mb-4 bg-gray-900  rounded-md p-2 flex gap-4 mta">
                            <label className=" items-center mt-auto  font-semibold mb-4">
                                <div className='flex gap-2'>
                                    <FlagIcon className='h-5' />
                                    Priority
                                </div>

                            </label>
                            <div className="flex ">
                                {['High', 'Medium', 'Low'].map((level) => (
                                    <label
                                        key={level}
                                        className={`px-4 py-2 rounded--xl font-semibold cursor-pointer ${priority === level
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={level}
                                            checked={priority === level}
                                            onChange={() => setPriority(level)}
                                            className="hidden"
                                        />
                                        {level}
                                    </label>
                                ))}
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
                        <div className="mb-4 ">
                            <Label className="block font-semibold mb-2">Select Days</Label>
                            <div className="grid grid-cols-7 bg-gray-800 p-2 rounded ">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <div key={day} className="flex  items-center">
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

                    {repeatType === 'Monthly' && (
                        <div className="mb-4">
                            <Label htmlFor="repeatMonthlyDay" className="block font-semibold mb-2">Select Day of the Month</Label>
                            {/* <select id="repeatMonthlyDay" value={repeatMonthlyDay} onChange={(e) => setRepeatMonthlyDay(e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="">Select Day</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select> */}
                            <CustomDaysSelect
                                options={Array.from({ length: 31 }, (_, i) => i + 1)}
                                selectedOptions={repeatMonthlyDays}
                                setSelectedOptions={setRepeatMonthlyDays}
                            />
                        </div>
                    )}
                    <Label htmlFor="dueDate" className="block font-semibold mb-2">Due Date</Label>

                    <div className="mb-4 flex justify-between">
                        {/* <Popover >
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[280px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Input type="datetime-local" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded px-3 py-2" />

                            </PopoverContent>
                        </Popover> */}
                        <Button
                            type="button"
                            onClick={() => setIsDateTimeModalOpen(true)}
                            className=" border rounded px-3 py-2"
                        >
                            {dueDate && dueTime
                                ? `${format(dueDate, "PPP")} ${dueTime}`
                                : "Select Date & Time"
                            }
                        </Button>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="assign-more-tasks"
                                checked={assignMoreTasks}
                                onChange={handleCheckboxChange}
                                className="form-checkbox"
                            />
                            <Label htmlFor="airplane-mode">Assign More Tasks</Label>
                        </div>

                        {isDateTimeModalOpen && (
                            <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
                                <DialogContent >
                                    <DialogTitle className='text-center'>Select Due Date & Time</DialogTitle>
                                    <DialogDescription>
                                        <div className="flex flex-col w-full py-4 space-y-4">
                                            <AnimatePresence>
                                                {isDatePickerVisible ? (
                                                    <motion.div
                                                        key="date-picker"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <CustomDatePicker
                                                            selectedDate={dueDate ?? new Date()}
                                                            onDateChange={(date: Date) => {
                                                                setDueDate(date);
                                                                setIsDatePickerVisible(false);
                                                            }}
                                                        />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="time-picker"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <CustomTimePicker
                                                            selectedTime={dueTime}
                                                            onTimeChange={setDueTime}
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => setIsDatePickerVisible(true)}
                                                            className="w-full bg-gray-500 text-white rounded px-4 py-2 mt-2"
                                                        >
                                                            Back to Date Picker
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                if (dueDate && dueTime) {
                                                                    const [hours, minutes] = dueTime.split(':').map(Number);
                                                                    const updatedDate = new Date(dueDate);
                                                                    updatedDate.setHours(hours, minutes);
                                                                    setDueDate(updatedDate);
                                                                    setIsDateTimeModalOpen(false);
                                                                }
                                                            }}
                                                            className="w-full bg-green-500 text-white rounded px-4 py-2 mt-2"
                                                        >
                                                            Update Time & Date
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                        </div>
                                    </DialogDescription>
                                </DialogContent>
                            </Dialog>
                        )}

                    </div>

                    {/* <div className="mb-4">
                        <Label htmlFor="attachment" className="block font-semibold">Attachment</Label>
                        <Input type="file" id="attachment" onChange={(e) => setAttachment(e.target.value)} className="w-full border rounded px-3 py-2" />
                    </div> */}
                    <div className='flex gap-4'>
                        <div onClick={() => { setIsLinkModalOpen(true) }} className='h-8 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-primary'>
                            <Link className='h-5 text-center m-auto mt-1' />
                        </div>
                        <div onClick={() => { setIsAttachmentModalOpen(true) }} className='h-8 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-primary'>
                            <Paperclip className='h-5 text-center m-auto mt-1' />
                        </div>
                        <div onClick={() => { setIsReminderModalOpen(true) }} className='h-8 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-primary'>
                            <Clock className='h-5 text-center m-auto mt-1' />
                        </div>
                        <div onClick={() => { setIsRecordingModalOpen(true) }} className='h-8 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-primary'>
                            <Mic className='h-5 text-center m-auto mt-1' />
                        </div>
                    </div>
                    <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                        <DialogContent>
                            <DialogTitle>Add Links</DialogTitle>
                            <DialogDescription>
                                Attach Links to the Task.
                            </DialogDescription>
                            <div className="mb-4">
                                <Label className="block font-semibold mb-2">Links</Label>
                                {links.map((link, index) => (
                                    <div key={index} className="flex gap-2 items-center mb-2">
                                        <Input type="text" value={link} onChange={(e) => handleLinkChange(index, e.target.value)} className="w-full border rounded px-3 py-2 mr-2" />
                                        <Button type="button" onClick={() => removeLinkField(index)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</Button>
                                    </div>
                                ))}
                                <Button type="button" onClick={addLinkField} className="bg-blue-500 text-white px-4 py-2 rounded">Add Link</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isAttachmentModalOpen} onOpenChange={setIsAttachmentModalOpen}>
                        <DialogContent>
                            <DialogTitle>Add an Attachment</DialogTitle>
                            <DialogDescription>
                                Add Attachments to the Task.
                            </DialogDescription>
                            <div className="mb-4">
                                <Label className="block font-semibold mb-2">Attachments</Label>
                                <Input type='file' />
                                <Button type="button" className="bg-blue-500 mt-2 text-white px-4 py-2 rounded">Add Link</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
                        <DialogContent>
                            <DialogTitle>Set a Reminder</DialogTitle>
                            <DialogDescription>
                                Set a Reminder to the Task.
                            </DialogDescription>
                            {/* <div className="mb-4">
                                <Label className="block font-semibold mb-2">Attachments</Label>
                                <Input type='file' />
                                <Button type="button" className="bg-blue-500 mt-2 text-white px-4 py-2 rounded">Add Link</Button>
                            </div> */}
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isRecordingModalOpen} onOpenChange={setIsRecordingModalOpen}>
                        <DialogContent>
                            <DialogTitle>Attach a Recording</DialogTitle>
                            <DialogDescription>
                                Add Recordings to the Task.
                            </DialogDescription>
                            <div className="mb-4">
                                <Label className="block font-semibold mb-2">Audio Recorder</Label>
                                {recording ? (
                                    <Button
                                        type="button"
                                        onClick={stopRecording}
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                    >
                                        Stop Recording
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={startRecording}
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        Start Recording
                                    </Button>
                                )}
                                {audioBlob && (
                                    <div className="mt-4">
                                        {audioURLRef.current && <audio controls src={audioURLRef.current || ''} />}
                                    </div>
                                )}
                            </div>
                            {/* <div className="mb-4">
                                <Label className="block font-semibold mb-2">Attachments</Label>
                                <Input type='file' />
                                <Button type="button" className="bg-blue-500 mt-2 text-white px-4 py-2 rounded">Add Link</Button>
                            </div> */}
                        </DialogContent>
                    </Dialog>
                    <div className="flex justify-end">
                        <Button type="button" onClick={handleAssignTask} className="bg-blue-500 text-white px-4 py-2 rounded">Assign Task</Button>
                        <Button type="button" onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded ml-2">Cancel</Button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default TaskModal;

interface CustomDaysSelectProps {
    options: number[];
    selectedOptions: number[];
    setSelectedOptions: Dispatch<SetStateAction<number[]>>;
}

const CustomDaysSelect: React.FC<CustomDaysSelectProps> = ({ options, selectedOptions, setSelectedOptions }) => {
    const [isDaysOpen, setIsDaysOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleOptionToggle = (option: number) => {
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(o => o !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    const handleOutsideClick = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setIsDaysOpen(false);
        }
    };

    useEffect(() => {
        if (isDaysOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isDaysOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                className="w-full p-2 border rounded text-left"
                onClick={() => setIsDaysOpen(!isDaysOpen)}
            >
                {selectedOptions.length > 0 ? selectedOptions.join(', ') : 'Select Days'}
            </button>
            {isDaysOpen && (
                <div className="absolute max-h-40 scrollbar-hide overflow-y-scroll -mt-48 text-black w-full bg-white border border-gray-300 rounded shadow-md z-50">
                    {options.map(option => (
                        <div key={option} className="flex items-center p-2 hover:bg-gray-100">
                            <input
                                type="checkbox"
                                checked={selectedOptions.includes(option)}
                                onChange={() => handleOptionToggle(option)}
                                className="mr-2"
                            />
                            <label>{option}</label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


interface User {
    _id: string;
    firstName: string;
    email: string;
}

interface UserSelectPopupProps {
    users: User[];
    assignedUser: string;
    setAssignedUser: (userId: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onClose: (userName: string) => void;
}


const UserSelectPopup: React.FC<UserSelectPopupProps> = ({ users, assignedUser, setAssignedUser, searchQuery, setSearchQuery, onClose }) => {
    const handleSelectUser = (selectedUserId: string) => {
        const selectedUser = users.find(user => user._id === selectedUserId);
        if (selectedUser) {
            setAssignedUser(selectedUser._id);
            onClose(selectedUser.firstName);
        }
    };

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="absolute bg-[#fefefe] text-black border mt-7 rounded shadow-md p-4 w-[20%] z-50">
            <input
                placeholder="🔎 Search user..."
                className="h-9 text-xs px-4 text-white w-full bg-gray-600 border rounded outline-none mb-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div>
                {filteredUsers.length === 0 ? (
                    <div>No users found.</div>
                ) : (
                    <div className="w-full text-sm max-h-40 overflow-y-scroll scrollbar-hide">
                        {filteredUsers.map(user => (
                            <div key={user._id} className="cursor-pointer p-2 flex items-center justify-between mb-1" onClick={() => handleSelectUser(user._id)}>
                                <span className='text-xs'>{user.email}</span>
                                <input
                                    type="radio"
                                    name="user"
                                    className='bg-primary'
                                    checked={assignedUser === user._id}
                                    onChange={() => handleSelectUser(user._id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

interface Category {
    _id: string;
    name: string;
}

interface CategorySelectPopupProps {
    categories: Category[];
    category: string;
    setCategory: Dispatch<SetStateAction<string>>;
    searchCategoryQuery: string;
    setSearchCategoryQuery: Dispatch<SetStateAction<string>>;
    newCategory: string;
    setNewCategory: Dispatch<SetStateAction<string>>;
    setCategories: Dispatch<SetStateAction<Category[]>>;
    onClose: (selectedValue: any) => void;
    role: string;
}


const CategorySelectPopup: React.FC<CategorySelectPopupProps> = ({ categories, category, setCategory, searchCategoryQuery, newCategory, setNewCategory, setCategories, setSearchCategoryQuery, onClose, role }) => {
    const handleSelectCategory = (selectedCategoryId: string) => {
        const selectedCategory = categories.find(category => category._id === selectedCategoryId);
        if (selectedCategory) {
            setCategory(selectedCategory._id);
            onClose(selectedCategory.name);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategory) return;

        try {
            const response = await axios.post('/api/category/create', { name: newCategory });

            if (response.status === 200) {
                // Add the new category to the categories list
                setCategories([...categories, response.data.data]);
                // Clear the new category input
                setNewCategory('');
            } else {
                console.error('Error creating category:', response.data.error);
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchCategoryQuery.toLowerCase())
    );

    return (
        <div className="absolute bg-[#fefefe] text-black border mt-2 rounded shadow-md p-4 w-[20%] z-50">
            <input
                placeholder="🔎 Search Categories..."
                className="h-9 text-xs px-4 text-white w-full bg-gray-800 border rounded outline-none mb-2"
                value={searchCategoryQuery}
                onChange={(e) => setSearchCategoryQuery(e.target.value)}
            />
            <div>
                {categories.length === 0 ? (
                    <div>No categories found.</div>
                ) : (
                    <div className="w-full text-sm max-h-40 overflow-y-scroll scrollbar-hide">
                        {filteredCategories.map(categorys => (
                            <div key={categorys._id} className="cursor-pointer p-2 flex items-center justify-between mb-1" onClick={() => handleSelectCategory(categorys._id)}>
                                <span className='px-4'>{categorys.name}</span>
                                <input
                                    type="radio"
                                    name="category"
                                    className='bg-primary'
                                    checked={category === categorys._id}
                                    onChange={() => handleSelectCategory(categorys._id)}
                                />
                                {category === categorys._id && (
                                    <CheckIcon className="ml-auto h-4 w-4" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {role === 'orgAdmin' && (
                    <div className="flex justify-center mt-4">
                        <div>
                            <Label>Add a New Category</Label>
                            <Input
                                type="text"
                                placeholder="New Category"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full text-black border rounded px-3 py-2"
                            />
                        </div>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={handleCreateCategory} className="px-4 py-2 bg-primary text-white rounded">
                                Create Category
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};