'use client'

import React, { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import axios from 'axios';
import { Clock, Link, MailIcon, Paperclip, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { FaUpload } from 'react-icons/fa';
import { Label } from '../ui/label';
import DaysSelectModal from '../modals/DaysSelect';
import { Toggle } from '../ui/toggle';


interface Reminder {
    type: 'minutes' | 'hours' | 'days' | 'specific'; // Added 'specific'
    value: number | undefined;  // Make value required
    date: Date | undefined;     // Make date required
    sent: boolean;
}


// Define the Task interface
interface Task {
    _id: string;
    title: string;
    user: User;
    description: string;
    assignedUser: User;
    category: { _id: string; name: string; }; // Update category type here
    priority: string;
    repeatType: string;
    repeat: boolean;
    days?: string[];
    audioUrl?: string;
    dates?: number[];
    categories?: string[];
    dueDate: string;
    completionDate: string;
    attachment?: string[];
    links?: string[];
    reminder: {
        email?: Reminder | null;  // Use the updated Reminder type
        whatsapp?: Reminder | null;  // Use the updated Reminder type
    } | null;
    status: string;
    comments: Comment[];
    createdAt: string;
}


interface User {
    _id: string;
    firstName: string;
    lastName: string;
    organization: string;
    email: string;
    role: string;
}



interface Category {
    _id: string;
    name: string;
}

interface EditTaskDialogProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onTaskUpdate: (task: Task) => void;
    users: User[];
    categories: Category[];
}

interface Comment {
    _id: string;
    userId: string; // Assuming a user ID for the commenter
    userName: string; // Name of the commenter
    comment: string;
    createdAt: string; // Date/time when the comment was added
    status: string;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ open, onClose, task, onTaskUpdate, users, categories }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        category: '',
        assignedUser: '',
        repeat: false,
        repeatType: 'Daily',
        dueDate: '',
        days: [] as string[],
        dates: [] as number[],
        attachment: [] as string[],
        links: [] as string[],
        status: 'Pending',
        reminder: {
            email: {
                type: 'minutes' as 'minutes' | 'hours' | 'days' | 'specific',
                value: undefined as number | undefined,
                date: undefined as Date | undefined,
                sent: false
            },
            whatsapp: {
                type: 'minutes' as 'minutes' | 'hours' | 'days' | 'specific',
                value: undefined as number | undefined,
                date: undefined as Date | undefined,
                sent: false
            }
        }
    });
    const [links, setLinks] = useState<string[]>(['']);
    const [files, setFiles] = useState<File[]>([]) // Updated to handle array of files
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
    const [days, setDays] = useState<string[]>([]);
    const [dates, setDates] = useState<number[]>([]);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Medium',
                category: task.category?._id || '',
                assignedUser: task.assignedUser._id || '',
                repeat: task.repeat || false,
                repeatType: task.repeatType || 'Daily',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                days: task.days || [],
                dates: task.dates || [],
                attachment: task.attachment || [],
                links: task.links || [],
                status: task.status || 'Pending',
                reminder: {
                    email: task.reminder?.email || {
                        type: 'minutes',
                        value: undefined,
                        date: undefined,
                        sent: false
                    },
                    whatsapp: task.reminder?.whatsapp || {
                        type: 'minutes',
                        value: undefined,
                        date: undefined,
                        sent: false
                    }
                }
            });
        }
    }, [task]);


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, type } = e.target;

        if (type === 'checkbox') {
            // Assert that e.target is an HTMLInputElement
            const input = e.target as HTMLInputElement;
            setFormData(prevState => ({
                ...prevState,
                [name]: input.checked // Checkbox elements use 'checked'
            }));
        } else {
            // For other types of elements, use 'value'
            const input = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            setFormData(prevState => ({
                ...prevState,
                [name]: input.value // Other elements use 'value'
            }));
        }
    };

    const handleDaysChange = (day: string) => {
        setFormData(prevState => ({
            ...prevState,
            days: prevState.days.includes(day)
                ? prevState.days.filter(d => d !== day)
                : [...prevState.days, day]
        }));
    };


    console.log(formData, 'form data');

    const handleLinkChange = (index: number, value: string) => {
        const updatedLinks = [...formData.links];
        updatedLinks[index] = value;
        setFormData(prevState => ({
            ...prevState,
            links: updatedLinks
        }));
    };

    const addLink = () => {
        setFormData(prevState => ({
            ...prevState,
            links: [...prevState.links, '']
        }));
    };

    const removeLink = (index: number) => {
        const updatedLinks = formData.links.filter((_, i) => i !== index);
        setFormData(prevState => ({
            ...prevState,
            links: updatedLinks
        }));
    };

    const handleSubmit = async () => {
        console.log(formData, 'form data'); // Check that formData contains updated 'days' and 'dates'

        try {
            const response = await axios.patch('/api/tasks/edit', { id: task?._id, ...formData });

            if (response.status === 200) { // Ensure success response
                onTaskUpdate(response.data.data);
                onClose(); // Close the dialog on success
            } else {
                console.error('Unexpected response status:', response.status);
            }
        } catch (error) {
            console.error('Error updating task:', error); // Improve error logging
            alert('Failed to update task. Please try again.'); // Provide user feedback
        }
    };


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;

        if (selectedFiles && selectedFiles.length > 0) {
            const validFiles: File[] = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                validFiles.push(file);
            }

            if (validFiles.length > 0) {
                try {
                    // Prepare the form data with the selected files for upload
                    const formData = new FormData();
                    validFiles.forEach((file) => formData.append('files', file));

                    // Upload the files to S3
                    const s3Response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    if (s3Response.ok) {
                        const s3Data = await s3Response.json();
                        const fileUrls = s3Data.fileUrls || [];

                        // Update the formData state with the file URLs from S3
                        setFormData((prevState) => ({
                            ...prevState,
                            attachment: [...prevState.attachment, ...fileUrls],
                        }));
                    } else {
                        console.error('Failed to upload files to S3');
                    }
                } catch (error) {
                    console.error('Error uploading files:', error);
                }
            }
        }
    };

    const handleRemoveFile = (fileUrl: string) => {
        // Remove the URL from formData state
        setFormData((prevState) => ({
            ...prevState,
            attachment: prevState.attachment.filter((url) => url !== fileUrl),
        }));
    };

    const handleReminderChange = (type: 'email' | 'whatsapp', field: 'type' | 'value' | 'date', value: any) => {
        setFormData(prevState => ({
            ...prevState,
            reminder: {
                ...prevState.reminder,
                [type]: {
                    ...prevState.reminder[type],
                    [field]: value
                }
            }
        }));
    };




    if (!open) return null; // Render nothing if the dialog is not open

    return (
        <div className="fixed inset-0 w-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1A1C20] border max-h-screen h-[500px] overflow-y-scroll scrollbar-hide p-6 text-xs rounded-lg max-w-screen w-1/2 shadow-lg">
                <div className='flex w-full justify-between'>
                    <h2 className="text-sm font-semibold mb-4">Edit Task</h2>
                    <h1 className='cursor-pointer' onClick={onClose}>X</h1>
                </div>
                <label className="block mb-2">
                    Title:
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border bg-transparent outline-none rounded mt-1"
                    />
                </label>
                <label className="block mb-2">
                    Description:
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-transparent outline-none p-2 border rounded mt-1"
                        rows={4}
                    />
                </label>
                <div className="grid gap-2 grid-cols-2">
                    <div className='flex justify-between gap-2 w-full'>
                        <div className='w-full'>
                            <label className="block mb-2">
                                Assigned User:
                                <select
                                    name="assignedUser"
                                    value={formData.assignedUser}
                                    onChange={handleChange}
                                    className="w-1/2 ml-2 outline-none p-2 border rounded mt-1"
                                >
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>



                    </div>

                    <div className='p-2 h-12 mt-1 rounded-lg flex gap-2 ml-auto'>
                        <h1 className='mt-2'>Category:</h1>

                        <label className="block mb-2 ">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-t outline-none p-2 border rounded "
                            >
                                {categories.map(category => (
                                    <option key={category._id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className='w-full flex justify-between'>
                    <div className="block mb-2">
                        <div className="flex gap-2   w-full rounded-lg mt-1">
                            <h1 className='text-xs mt-2' >Priority:</h1>

                            <div className='mt-2'>
                                {['High', 'Medium', 'Low'].map((level) => (
                                    <label
                                        key={level}
                                        className={`px-4 py-2 text-xs border border-[#505356] font-semibold cursor-pointer ${formData.priority === level
                                            ? 'bg-[#017A5B] text-white'
                                            : 'bg-[#282D32] text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={level}
                                            checked={formData.priority === level}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        {level}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <label className="flex mt-2 items-center mb-4">
                        <input
                            type="checkbox"
                            name="repeat"
                            checked={formData.repeat}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        Repeat
                    </label>
                </div>
                {formData.repeat && (
                    <div className="flex w-full justify-end">
                        <label className="block mb-2">
                            Repeat Type:
                            <select
                                name="repeatType"
                                value={formData.repeatType}
                                onChange={handleChange}
                                className="w-full p-2 border outline-none rounded mt-1"
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </label>
                    </div>
                )}


                {formData.repeatType === 'Weekly' && formData.repeat && (
                    <div className="mb-4">
                        <Label className="block font-semibold mb-2">Select Days</Label>
                        <div className="grid grid-cols-7 p-2 rounded">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <div key={day} className="flex gap-2 cursor-pointer items-center">
                                    <Toggle
                                        variant="outline"
                                        aria-label={`${day}`}
                                        onClick={() => handleDaysChange(day)}
                                        className={formData.days.includes(day) ? "text-white cursor-pointer" : "text-black cursor-pointer"}
                                    >
                                        <Label htmlFor={day} className="font-semibold cursor-pointer">{day.slice(0, 1)}</Label>
                                    </Toggle>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {formData.repeatType === 'Monthly' && formData.repeat && (
                    <div>
                        <DaysSelectModal
                            isOpen={isDateTimeModalOpen}
                            onOpenChange={setIsDateTimeModalOpen}
                            selectedDays={formData.dates}
                            setSelectedDays={(update) => setFormData(prev => ({
                                ...prev,
                                dates: typeof update === 'function' ? update(prev.dates) : update  // Handles both function and direct state
                            }))}
                        />
                    </div>
                )}
                <div className='flex gap-2 mt-2'>
                    <label className="block mb-2">
                        Due Date:
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className=" p-2 ml-1 border rounded mt-1"
                        />
                    </label>
                </div>
                <div className='flex    gap-4'>
                    <div className='flex mt-4  gap-2'>
                        <div onClick={() => { setIsLinkModalOpen(true) }} className={`h-8 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-[#282D32] ${links.filter(link => link).length > 0 ? 'border-[#017A5B]' : ''}`}>
                            <Link className='h-5 text-center m-auto mt-1' />
                        </div>
                        {links.filter(link => link).length > 0 && (
                            <span className="text-xs mt-2 text">{links.filter(link => link).length} Links</span> // Display the count of non-empty links
                        )}
                    </div>

                    <div className='flex mt-4 gap-2'>
                        <div onClick={() => { setIsAttachmentModalOpen(true) }} className={`h-8 w-8 rounded-full items-center text-center border cursor-pointer hover:shadow-white shadow-sm bg-[#282D32] ${formData.attachment.length > 0 ? 'border-[#017A5B]' : ''
                            }`} >
                            <Paperclip className='h-5 text-center m-auto mt-1' />

                        </div>
                        {formData.attachment.length > 0 && (
                            <span className="text-xs mt-2 text">{formData.attachment.length} Attachments</span> // Display the count
                        )}
                    </div>

                    <div onClick={() => { setIsReminderModalOpen(true) }} className='h-8 mt-4 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-[#282D32] '>
                        <Clock className='h-5 text-center m-auto mt-1' />
                    </div>
                    {/* <div onClick={() => { setIsRecordingModalOpen(true) }} className='h-8 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-[#282D32] '>
                            <Mic className='h-5 text-center m-auto mt-1' />
                        </div> */}
                    {/* {recording ? (
                        <div onClick={stopRecording} className='h-8 mt-4 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm   bg-red-500'>
                            <Mic className='h-5 text-center m-auto mt-1' />
                        </div>
                    ) : (
                        <div onClick={startRecording} className='h-8 mt-4 w-8 rounded-full items-center text-center  border cursor-pointer hover:shadow-white shadow-sm  bg-[#282D32]'>
                            <Mic className='h-5 text-center m-auto mt-1' />
                        </div>
                    )} */}

                </div>
                <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                    <DialogContent>
                        <div className='flex justify-between'>
                            <DialogTitle>Add Links</DialogTitle>
                            <DialogClose>X</DialogClose>
                        </div>
                        <DialogDescription>
                            Attach Links to the Task.
                        </DialogDescription>
                        <div className="mb-4">
                            <Label className="block font-semibold mb-2">Links</Label>
                            {/* {links.map((link, index) => (
                                <div key={index} className="flex gap-2 items-center mb-2">
                                    <input type="text" value={link} onChange={(e) => handleLinkChange(index, e.target.value)} className="w-full outline-none border-[#505356]  bg-transparent border rounded px-3 py-2 mr-2" />
                                    <Button type="button" onClick={() => removeLinkField(index)} className="bg-red-500 hover:bg-red-500 text-white rounded">Remove</Button>
                                </div>
                            ))} */}
                            {formData.links.map((link, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="text"
                                        value={link}
                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                        className="w-full p-2 borde outline-none rounded mr-2"
                                    />
                                    <button
                                        onClick={() => removeLink(index)}
                                        className="bg-red-500 text-white p-2 rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <div className='w-full flex justify-between mt-6'>
                                <Button type="button" onClick={addLink} className="bg-transparent border border-[#505356] text-white hover:bg-[#017A5B] px-4 py-2 flex gap-2 rounded">Add Link
                                    <Plus />
                                </Button>
                                <Button type="button" onClick={() => setIsLinkModalOpen(false)} className="bg-[#017A5B] text-white hover:bg-[#017A5B] px-4 py-2 rounded">Save Links</Button>
                            </div>

                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={isAttachmentModalOpen} onOpenChange={setIsAttachmentModalOpen}>
                    <DialogContent>
                        <div className='flex w-full justify-between'>
                            <DialogTitle>Add an Attachment</DialogTitle>
                            <DialogClose>X</DialogClose>
                        </div>
                        <DialogDescription>
                            Add Attachments to the Task.
                        </DialogDescription>
                        <div className='flex items-center space-x-2'>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                style={{ display: 'none' }} // Hide the file input
                            />

                            <label htmlFor='file-upload' className='cursor-pointer flex items-center space-x-2'>
                                <FaUpload className='h-5 w-5' />
                                <span>Attach Files</span>
                            </label>
                        </div>

                        {/* Display selected file names */}
                        <div>
                            {formData.attachment.length > 0 && (
                                <ul className='list-disc list-inside'>
                                    <div className='grid grid-cols-2 gap-3'>

                                        {formData.attachment.map((fileUrl, index) => {
                                            // Determine if the fileUrl is an image based on its extension or content type
                                            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileUrl);

                                            return (
                                                <li key={index} className='flex items-center space-x-2'>

                                                    {isImage ? (
                                                        <img
                                                            src={fileUrl}
                                                            alt={`Attachment ${index}`}
                                                            className='h-12 w-12 rounded-full object-cover'
                                                        />
                                                    ) : (
                                                        <span>{fileUrl.split('/').pop()}</span>
                                                    )}

                                                    <button
                                                        className='text-red-500'
                                                        onClick={() => handleRemoveFile(fileUrl)}
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </div>

                                </ul>
                            )}
                        </div>

                        <Button className='bg-[#017A5B] hover:bg-[#017A5B]' onClick={() => setIsAttachmentModalOpen(false)}>Save Attachments</Button>
                    </DialogContent>
                </Dialog>
                <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
                    <DialogContent>
                        <div className='flex justify-between'>
                            <DialogTitle>Set a Reminder</DialogTitle>
                            <img className='cursor-pointer h-fit' src='/icons/x.png' onClick={() => setIsReminderModalOpen(false)} />
                        </div>
                        <DialogDescription>
                            Set a reminder for the task.
                        </DialogDescription>
                        <div className="reminder-section grid grid-cols-1 gap-4">
                            {/* WhatsApp Reminder Row */}
                            <div className="whatsapp-reminder flex items-center gap-4">
                                <img src='/whatsapp.png' className='h-6 w-6' />
                                <div className="reminder-type-select grid grid-cols-2 gap-2">
                                    <select
                                        value={formData.reminder?.whatsapp?.type || 'minutes'}
                                        className='p-2 outline-none'
                                        onChange={(e) => handleReminderChange('whatsapp', 'type', e.target.value)}
                                    >
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                        <option value="specific">Specific Date & Time</option>
                                    </select>
                                    {formData.reminder?.whatsapp?.type !== 'specific' && (
                                        <input
                                            type="number"
                                            className='p-2 outline-none'
                                            value={formData.reminder?.whatsapp?.value || ''}
                                            onChange={(e) => handleReminderChange('whatsapp', 'value', parseInt(e.target.value) || undefined)}
                                            placeholder={`Enter number of ${formData.reminder?.whatsapp?.type}`}
                                        />
                                    )}
                                    {formData.reminder?.whatsapp?.type === 'specific' && (
                                        <input
                                            type="datetime-local"
                                            className='p-2 outline-none'
                                            value={formData.reminder?.whatsapp?.date ? new Date(formData.reminder.whatsapp.date).toISOString().slice(0, 16) : ''}
                                            onChange={(e) => handleReminderChange('whatsapp', 'date', e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Email Reminder Row */}
                            <div className="email-reminder flex items-center gap-4">
                                <MailIcon className='h-8' />
                                <div className="reminder-type-select grid grid-cols-2 gap-2">
                                    <select
                                        value={formData.reminder?.email?.type || 'minutes'}
                                        className='p-2 outline-none'
                                        onChange={(e) => handleReminderChange('email', 'type', e.target.value)}
                                    >
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                        <option value="specific">Specific Date & Time</option>
                                    </select>
                                    {formData.reminder?.email?.type !== 'specific' && (
                                        <input
                                            type="number"
                                            className='p-2 outline-none'
                                            value={formData.reminder?.email?.value || ''}
                                            onChange={(e) => handleReminderChange('email', 'value', parseInt(e.target.value) || undefined)}
                                            placeholder={`Enter number of ${formData.reminder?.email?.type}`}
                                        />
                                    )}
                                    {formData.reminder?.email?.type === 'specific' && (
                                        <input
                                            type="datetime-local"
                                            className='p-2 outline-none'
                                            value={formData.reminder?.email?.date ? new Date(formData.reminder.email.date).toISOString().slice(0, 16) : ''}
                                            onChange={(e) => handleReminderChange('email', 'date', e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                    )}
                                </div>
                            </div>

                            <Button className='hover:bg-[#007A5A] bg-[#007A5A]' onClick={() => setIsReminderModalOpen(false)}>Save Reminders</Button>
                        </div>
                    </DialogContent>
                </Dialog>




                <div className="flex justify-end mt-4">

                    <button
                        onClick={handleSubmit}
                        className="bg-[#017A5B]  w-full text-white p-2 rounded"
                    >
                        Update Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskDialog;
