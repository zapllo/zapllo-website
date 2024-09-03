'use client'

import ChecklistSidebar from '@/components/sidebar/checklistSidebar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import Loader from '@/components/ui/loader'
import { Separator } from '@radix-ui/react-separator'
import axios from 'axios'
import { X, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { FaUpload } from 'react-icons/fa'

type Ticket = {
    _id: string;
    category: string;
    subcategory: string;
    subject: string;
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
    const [loading, setLoading] = useState<boolean>(true); // Add loading state

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

    const handleSubmit = async () => {
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
                    return;
                }
            } catch (error) {
                console.error('Error uploading files:', error);
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
                setCategory('');
                setSubcategory('');
                setSubject('');
                setDescription('');
                setFiles([]); // Clear files after submission
            } else {
                console.error('Failed to create ticket');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    };

    const handleViewDetails = (ticket: Ticket) => {
        router.push(`/dashboard/tickets/${ticket._id}`) // Navigate to the ticket details page
    };

    return (
        <div className="flex mt-24">
            <ChecklistSidebar />
            <div className="flex-1 p-4">
                <div className="w-full -ml-2  mx-auto">
                    <div className="gap-2 flex mb-6 w-full">
                        <div className="-mt-2 w-full">
                            {loading ? (
                                <Loader />
                            ) : (

                                <div className='p-10    flex justify-center -mt-16 l w-full max-w-8xl  ml-52'>


                                    <div className='overflow-x-auto  w-full max-w-4xl -ml-56 '>
                                        <div className='w-full max-w-8xl mb-4 flex  justify-center'>
                                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                <div className='flex mb-2 gap-2 justify-between'>
                                                    <h1 className='text-md m font-medium'>Support Tickets</h1>
                                                    <div className=''>
                                                        <DialogTrigger asChild>
                                                            <Button className='bg-[#75517B] h-7 rounded n text-xs hover:bg-[#75517B]'>Raise A Ticket</Button>
                                                        </DialogTrigger>
                                                    </div>

                                                </div>
                                                <Separator className='bg-[#380E3D]' />
                                                <DialogContent className='space-y-2 overflow-y-scroll scrollbar-hide max-h-2xl'>
                                                    <DialogClose asChild>
                                                        <button className='absolute top-4 right-4 text-white hover:text-gray-400'>
                                                            <X className='h-6 w-6' />
                                                        </button>
                                                    </DialogClose>
                                                    <h1 className='text-center text-lg font-medium'>Raise a Ticket</h1>
                                                    <div>
                                                        <label htmlFor='category' className='block text-sm font-medium text-white -700'>
                                                            Select Category
                                                        </label>
                                                        <select
                                                            id='category'
                                                            value={category}
                                                            onChange={(e) => setCategory(e.target.value)}
                                                            className='mt-1 block w-full border outline-none p-2 rounded-md shadow-sm sm:text-sm'
                                                        >
                                                            <option disabled value=''>Select a category</option>
                                                            <option value='Report An Error'>Report An Error</option>
                                                            <option value='Provide Feedback'>Provide Feedback</option>
                                                            <option value='Payment/Subscription Issue'>Payment/Subscription Issue</option>
                                                            <option value='Delete My Account'>Delete My Account</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor='subcategory' className='block text-sm font-medium text-white -700'>
                                                            Select Subcategory
                                                        </label>
                                                        <select
                                                            id='subcategory'
                                                            value={subcategory}
                                                            onChange={(e) => setSubcategory(e.target.value)}
                                                            className='mt-1 block w-full rounded-md shadow-sm outline-none p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
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
                                                        <label htmlFor='subject' className='block text-sm font-medium text-white -700'>
                                                            Subject
                                                        </label>
                                                        <input
                                                            type='text'
                                                            id='subject'
                                                            value={subject}
                                                            placeholder='Enter the subject for the ticket'
                                                            onChange={(e) => setSubject(e.target.value)}
                                                            className='mt-1 block w-full rounded-md shadow-sm outline-none p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor='description' className='block text-sm font-medium text-white -700'>
                                                            Description
                                                        </label>
                                                        <textarea
                                                            id='description'
                                                            rows={4}
                                                            value={description}
                                                            placeholder='Describe in detail and attach files (if any)'
                                                            onChange={(e) => setDescription(e.target.value)}
                                                            className='mt-1 block w-full rounded-md shadow-sm outline-none p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
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
                                                            <FaUpload className='h-5 w-5' />
                                                            <span>Attach Files</span>
                                                        </label>
                                                    </div>

                                                    {/* Display selected file names */}
                                                    <div>
                                                        {files.length > 0 && (
                                                            <ul className='list-disc list-inside'>
                                                                {files.map((file, index) => (
                                                                    <li key={index}>{file.name}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>

                                                    <div className='flex justify-center'>
                                                        <Button onClick={handleSubmit} className='bg-[#75517B] hover:bg-[#75517B]'>
                                                            Submit Ticket
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <table className='min-w-full divide-y 0'>

                                            <thead className='bg-[#380E3D] text-white'>
                                                <tr>
                                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-white -500 uppercase tracking-wider'>
                                                        Category
                                                    </th>
                                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-white -500 uppercase tracking-wider'>
                                                        Subject
                                                    </th>
                                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-white -500 uppercase tracking-wider'>
                                                        Created At
                                                    </th>
                                                    <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-white -500 uppercase tracking-wider'>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-[#1A1C20] divide-y'>
                                                {tickets.map((ticket) => (
                                                    <tr key={ticket._id}>
                                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-white -900'>
                                                            {ticket.category}
                                                        </td>
                                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-white -500'>
                                                            {ticket.subject}
                                                        </td>
                                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-white -500'>
                                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                                            <div
                                                                onClick={() => handleViewDetails(ticket)}
                                                                className='text-[#] -600 hover:text-[#007A5A] -900'
                                                            >
                                                                <Eye className='h-5 w-5' />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

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
