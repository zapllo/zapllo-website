'use client'

import DeleteConfirmationDialog from '@/components/modals/deleteConfirmationDialog'
import ChecklistSidebar from '@/components/sidebar/checklistSidebar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import Loader from '@/components/ui/loader'
import { Separator } from '@radix-ui/react-separator'
import axios from 'axios'
import { X, Eye, Trash, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { FaUpload } from 'react-icons/fa'
import { toast, Toaster } from 'sonner'

type Ticket = {
    _id: string;
    category: string;
    subcategory: string;
    subject: string;
    status: string;
    description: string;
    fileUrl?: string[]; // Add fileUrl
    user: { name: string }; // Assuming user has a 'name' field
    createdAt: string;
};

export default function Tickets() {
    const router = useRouter();
    const [category, setCategory] = useState<string>('');
    const [subcategory, setSubcategory] = useState<string>('');
    const [subject, setSubject] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [files, setFiles] = useState<File[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [userId, setUserId] = useState<string>('');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Track submission
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false); // For delete confirmation
    const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null); // Store the ticket to delete

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const userRes = await axios.get('/api/users/me');
                setUserId(userRes.data.data._id);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        }
        getUserDetails();
    }, []);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true); // Set loading to true before fetching
            const response = await fetch('/api/tickets/get');
            const data = await response.json();
            console.log('Fetched Tickets:', data); // Log the data to check its structure
            setTickets(data);
            setLoading(false); // Set loading to true before fetching
        };
        fetchTickets();
    }, []);

    const handleDeleteTicket = async () => {
        if (!ticketToDelete) return;
        try {
            const response = await fetch(`/api/tickets/${ticketToDelete._id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setTickets(tickets.filter(ticket => ticket._id !== ticketToDelete._id));
                toast.success('Ticket deleted successfully');
            } else {
                toast.error('Failed to delete ticket');
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
            toast.error('Error deleting ticket');
        }
        setIsDeleteDialogOpen(false);
    };


    const handleOpenDeleteDialog = (ticket: Ticket) => {
        setTicketToDelete(ticket);
        setIsDeleteDialogOpen(true);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;

        if (selectedFiles && selectedFiles.length > 0) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'video/mp4', 'video/mpeg'];
            const validFiles: File[] = [];

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];

                if (allowedTypes.includes(file.type)) {
                    validFiles.push(file);
                } else {
                    alert(`File "${file.name}" is not a valid type. Please upload only images or videos.`);
                }
            }

            if (validFiles.length > 0) {
                setFiles(validFiles); // Update state with valid files
            }
        }
    };


    const removeFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, fileIndex) => fileIndex !== index)); // Remove the file at the selected index
    };

    const handleSubmit = async () => {
        setIsSubmitting(true); // Start loader
        let fileUrl = [];
        if (files && files.length > 0) {
            // Upload files to S3 and get the URLs
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            try {
                const s3Response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (s3Response.ok) {
                    const s3Data = await s3Response.json();
                    console.log('S3 Data:', s3Data); // Log the response from S3
                    fileUrl = s3Data.fileUrls;
                } else {
                    console.error('Failed to upload files to S3');
                    setIsSubmitting(false); // End loader in case of error
                    return;
                }
            } catch (error) {
                console.error('Error uploading files:', error);
                setIsSubmitting(false); // End loader in case of error
                return;
            }
        }

        const ticketData = {
            category,
            subcategory,
            subject,
            description,
            user: userId,
            fileUrl, // Include array of fileUrls
        };

        console.log('Ticket Data:', ticketData); // Log the ticket data

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ticketData),
            });

            if (response.ok) {
                const newTicket = await response.json();
                setTickets([...tickets, newTicket]);
                toast.success("Ticket Raised successfully!")
                setCategory('');
                setSubcategory('');
                setSubject('');
                setIsDialogOpen(false);
                setDescription('');
                setFiles([]); // Clear files after submission
            } else {
                console.error('Failed to create ticket');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
        setIsSubmitting(false); // End loader after submission
    };

    const handleViewDetails = (ticket: Ticket) => {
        router.push(`/help/tickets/${ticket._id}`) // Navigate to the ticket details page
    };

    return (
        <div className="flex mt-24">
            <ChecklistSidebar />
            <Toaster />
            <div className="flex-1 p-4">
                <div className="w-full -ml-2  mx-auto">
                    <div className="gap-2 flex mb-6 w-full">
                        <div className="-mt-2 w-full">
                            {loading ? (
                                <Loader />
                            ) : (

                                <div className='p-10    flex justify-center -mt-16 l w-full max-w-8xl  ml-52'>


                                    <div className='overflow-x-auto scrollbar-hide  w-full max-w-4xl -ml-56 '>
                                        <div className='w-full max-w-8xl mb-4 flex  justify-center'>
                                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                <div className='flex mb-2 gap-2 justify-between'>
                                                    <h1 className='text-md m font-medium'>Support Tickets</h1>
                                                    <div className=''>
                                                        <DialogTrigger asChild>
                                                            <Button className='bg-[#017a5b] h-7 rounded n text-xs hover:bg-[#017a5b]'>Raise A Ticket</Button>
                                                        </DialogTrigger>
                                                    </div>
                                                </div>
                                                <Separator className='bg-[#0A0D28]' />
                                                <DialogContent className=' overflow-y-scroll h-[500px] w-[35%] scrollbar-hide max-h-lg'>
                                                    <DialogClose asChild>
                                                        <button className='absolute top-4 right-4 text-white hover:text-gray-400'>
                                                            <X className='h-4 w-4 mt-3' />
                                                        </button>
                                                    </DialogClose>
                                                    <h1 className='text-center text-sm font-medium'>Raise a Ticket</h1>
                                                    <div>
                                                        {/* <label htmlFor='category' className='block text-xs font-medium text-white -700'>
                                                            Select Category
                                                        </label> */}
                                                        <select
                                                            id='category'
                                                            value={category}
                                                            onChange={(e) => setCategory(e.target.value)}
                                                            className=' block w-full border outline-none p-2 rounded-md shadow-sm sm:text-xs'
                                                        >
                                                            <option disabled value=''>Select a category</option>
                                                            <option value='Report An Error'>Report An Error</option>
                                                            <option value='Provide Feedback'>Provide Feedback</option>
                                                            <option value='Payment/Subscription Issue'>Payment/Subscription Issue</option>
                                                            <option value='Delete My Account'>Delete My Account</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        {/* <label htmlFor='subcategory' className='block text-xs font-medium text-white -700'>
                                                            Select Subcategory
                                                        </label> */}
                                                        <select
                                                            id='subcategory'
                                                            value={subcategory}
                                                            onChange={(e) => setSubcategory(e.target.value)}
                                                            className=' block w-full rounded-md shadow-sm outline-none p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs'
                                                        >
                                                            <option disabled value=''>Select a subcategory</option>
                                                            <option value='Task Delegation'>Task Delegation</option>
                                                            <option value='My Team'>My Team</option>
                                                            <option value='Intranet'>Intranet</option>
                                                            <option value='Leaves'>Leaves</option>
                                                            <option value='Attendance'>Attendance</option>
                                                            <option value='Other'>Other</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <div className='relative'>
                                                            <label htmlFor='subject' className='absolute -mt-2 ml-2 bg-[#0B0D29] text-xs font-medium text-white -700'>
                                                                Subject
                                                            </label>
                                                            <input
                                                                type='text'
                                                                id='subject'
                                                                value={subject}
                                                                onChange={(e) => setSubject(e.target.value)}
                                                                className='mt-1 block w-full rounded-md shadow-sm outline-none p-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs'
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='relative'>
                                                        <label htmlFor='subject' className='absolute -mt-1 ml-2 bg-[#0B0D29] text-xs font-medium text-white -700'>
                                                            Description
                                                        </label>
                                                        <textarea
                                                            id='description'
                                                            rows={4}
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                            className='mt-1 block w-full rounded-md shadow-sm outline-none p-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs'
                                                        />

                                                    </div>

                                                    <div className='flex items-center space-x-2'>
                                                        <input
                                                            id="file-upload"
                                                            type="file"
                                                            multiple
                                                            onChange={handleFileUpload}
                                                            style={{ display: 'none' }} // Hide the file input
                                                        />

                                                        <label htmlFor='file-upload' className='cursor-pointer flex items-center space-x-2'>
                                                            <FaUpload className='h-3 w-3' />
                                                            <span className='text-xs'>Attach Files</span>
                                                        </label>
                                                    </div>

                                                    {/* Display selected file names */}
                                                    <div>
                                                        {files.length > 0 && (
                                                            <ul className='list-disc list-inside'>
                                                                {files.map((file, index) => (
                                                                    <li className='text-xs flex justify-between ml-4' key={index}>{file.name}
                                                                        <div>
                                                                            <button
                                                                                onClick={() => removeFile(index)}
                                                                                className="ml- text-red-600 hover:text-red-800 text-xs "
                                                                            >
                                                                                <X className='h-4 w-4' />
                                                                            </button>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-center">
                                                        {isSubmitting ? (
                                                            <Loader />
                                                        ) : (
                                                            <Button onClick={handleSubmit} className="bg-[#815BF5] hover:bg-[#815BF5] text-xs">
                                                                Submit Ticket
                                                            </Button>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <table className='min-w-full divide-y 0'>

                                            <thead className='bg-[#0A0D28] text-white'>
                                                <tr>
                                                    {/* <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-white -500 uppercase tracking-wider'>
                                                        Category
                                                    </th> */}
                                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-white -500 uppercase tracking-wider'>
                                                        Subject
                                                    </th>
                                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-white -500 uppercase tracking-wider'>
                                                        Status
                                                    </th>
                                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-white -500 uppercase tracking-wider'>
                                                        Created At
                                                    </th>
                                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-white -500 uppercase tracking-wider'>
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-[#0B0D29] divide-y'>
                                                {tickets.map((ticket) => (
                                                    <tr key={ticket._id}>
                                                        {/* <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-white -900'>
                                                            {ticket.category}
                                                        </td> */}
                                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-white -500'>
                                                            {ticket.subject}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm   -500 ${ticket.status === "Pending" ? "text-red-800" : ticket.status === "In Resolution" ? "text-blue-400" : ticket.status === "Closed" ? "text-green-700" : "text-yellow-400"}`}>
                                                            {ticket.status}
                                                        </td>
                                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-white -500'>
                                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                                            <div className='flex gap-2 items-center'>
                                                                <div
                                                                    onClick={() => handleViewDetails(ticket)}
                                                                    className='text-[#] -600 cursor-pointer hover:text-[#007A5A] -900'
                                                                >
                                                                    <Eye className='h-5 w-5' />
                                                                </div>
                                                                <div
                                                                    onClick={() => handleOpenDeleteDialog(ticket)}
                                                                    className='text-red-500 cursor-pointer hover:text-red-800'
                                                                >
                                                                    <Trash2 className='h-5 w-5' />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <DeleteConfirmationDialog
                                        isOpen={isDeleteDialogOpen}
                                        onClose={() => setIsDeleteDialogOpen(false)}
                                        onConfirm={handleDeleteTicket}
                                    />

                                    {selectedTicket && (
                                        <Dialog open={isViewDialogOpen} onOpenChange={() => setIsViewDialogOpen(false)}>
                                            <DialogContent className='p-6 space-y-4 text-sm'>
                                                <DialogClose asChild>
                                                    <button className='absolute top-4 right-4 text-white hover:text-gray-400'>
                                                        <X className='h-6 w-6' />
                                                    </button>
                                                </DialogClose>
                                                <h1>Ticket : {selectedTicket.subject}</h1>
                                                <h2 className=' font-semibold'>Subject: {selectedTicket.subject}</h2>
                                                <p><strong>Category:</strong> {selectedTicket.category}</p>
                                                <p><strong>Description:</strong> {selectedTicket.description}</p>
                                                {/* {selectedTicket.fileUrl && (
                                                <div>
                                                    <p><strong>Attachment:</strong></p>
                                                    <a href={selectedTicket.fileUrl} target='_blank' rel='noopener noreferrer'>
                                                        <img src={selectedTicket.fileUrl} alt='Attachment' className='max-w-full h-full max-h-32 rounded-lg ' />
                                                    </a>
                                                </div>
                                            )} */}
                                            </DialogContent>
                                        </Dialog>
                                    )}

                                </div>


                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
