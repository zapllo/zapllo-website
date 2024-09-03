import React, { Dispatch, SetStateAction, useState } from 'react'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';
import { Separator } from '../ui/separator';
import { UpdateIcon } from '@radix-ui/react-icons';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { ArrowLeft, Bell, Calendar, CheckCheck, CheckCircle, Circle, Clock, Edit, File, FileTextIcon, Flag, GlobeIcon, Link, Loader, MailIcon, PlayIcon, Repeat, RepeatIcon, Tag, Trash } from 'lucide-react';
import EditTaskDialog from './editTask';
import CopyToClipboard from 'react-copy-to-clipboard';
import { IconCopy } from '@tabler/icons-react';
import CustomAudioPlayer from './customAudioPlayer';
import { toast } from 'sonner';
import axios from 'axios';

type Props = {}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    organization: string;
    email: string;
    role: string;
}

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
    dueDate: Date;
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

interface Comment {
    _id: string;
    userId: string; // Assuming a user ID for the commenter
    userName: string; // Name of the commenter
    comment: string;
    createdAt: string; // Date/time when the comment was added
    status: string;
    fileUrl?: string[]; // Optional array of URLs
    tag?: 'In Progress' | 'Completed' | 'Reopen'; // Optional tag with specific values
}

interface Category {
    _id: string;
    name: string; // Assuming a user ID for the commenter
    organization: string; // Name of the commenter
    imgSrc: string;
}


interface TaskDetailsProps {
    selectedTask: Task;
    onTaskUpdate: (updatedTask: Task) => void;
    onClose: () => void;
    handleUpdateTaskStatus: () => Promise<void>;
    handleDelete: (taskId: string) => Promise<void>;
    handleEditClick: () => void;
    handleDeleteClick: (taskId: string) => void;
    handleDeleteConfirm: () => void;
    handleCopy: (link: string) => void;
    setSelectedTask: (task: Task | null) => void;
    setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
    setIsReopenDialogOpen: Dispatch<SetStateAction<boolean>>;
    isEditDialogOpen: boolean;
    setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
    setIsCompleteDialogOpen: Dispatch<SetStateAction<boolean>>;
    setStatusToUpdate: Dispatch<SetStateAction<string | null>>; // Update the type here
    formatTaskDate: (dateTimeString: string | Date) => string;
    users: User[];
    sortedComments?: Comment[];
    categories: Category[];
    formatDate: (dateTimeString: string) => string;
}



const TaskDetails: React.FC<TaskDetailsProps> = ({ selectedTask,
    onTaskUpdate,
    onClose,
    handleUpdateTaskStatus,
    handleDeleteClick,
    handleEditClick,
    setSelectedTask,
    handleCopy,
    setStatusToUpdate,
    setIsDialogOpen,
    setIsReopenDialogOpen,
    setIsCompleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    users,
    handleDeleteConfirm,
    sortedComments,
    formatDate,
    categories,
    formatTaskDate, }) => {

    return (
        <div>
            <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                <SheetContent className="max-w-4xl  w-full ">
                    <SheetHeader>
                        <div className="flex gap-2">
                            <ArrowLeft className="cursor-pointer h-7 w-7 bg-[#121212] border border-white rounded-full" onClick={() => setSelectedTask(null)} />
                            <SheetTitle className="text-white mb-4">
                                Task details
                            </SheetTitle>
                        </div>
                    </SheetHeader>
                    <div className="border overflow-y-scroll scrollbar-hide   h-10/11 p-4 rounded-lg">
                        <h1 className="font-bold text-sm px-2">{selectedTask.title}</h1>
                        <div className="flex mt-4 justify-start space-x-12  text-start items-center gap-6 px-2">
                            <div className="flex items-center gap-4">
                                <Label htmlFor="user" className="text-right text-xs">
                                    Assigned To
                                </Label>
                                {selectedTask?.assignedUser?.firstName ? (
                                    <div className="flex gap-2  justify-start">
                                        <div className="h-6 w-6  rounded-full bg-primary -400">
                                            <h1 className="text-center uppercase  text-xs mt-1">
                                                {`${selectedTask?.assignedUser?.firstName?.slice(0, 1)}`}
                                                {`${selectedTask?.assignedUser?.lastName?.slice(0, 1)}`}
                                            </h1>
                                        </div>
                                        <h1 id="assignedUser" className="col-span-3 text-sm">{`${selectedTask.assignedUser.firstName} ${selectedTask.assignedUser.lastName}`}</h1>

                                    </div>
                                ) : null}
                            </div>
                            <div className=" flex items-center gap-4">
                                <Label htmlFor="user" className="text-right text-xs">
                                    Assigned By
                                </Label>
                                {selectedTask?.user?.firstName ? (
                                    <div className="flex gap-2 justify-start">
                                        <div className="h-6 w-6 rounded-full bg-[#4F2A2B]">
                                            <h1 className="text-center text-xs mt-1 uppercase">
                                                {selectedTask.user.firstName.slice(0, 1)}
                                                {selectedTask.user.lastName.slice(0, 1)}
                                            </h1>
                                        </div>
                                        <h1 id="assignedUser" className="col-span-3 text-sm">
                                            {`${selectedTask.user.firstName} ${selectedTask.user.lastName}`}
                                        </h1>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            <Calendar className="h-4 text-[#E94C4C]" />
                            <Label htmlFor="user" className="text-right text-sm">
                                Created At
                            </Label>
                            <div className="flex gap-2 ml-2 text-xs  justify-start">
                                {/* <Calendar className="h-5" /> */}
                                <h1 id="assignedUser" className="col-span-3 font-">
                                    {formatTaskDate(selectedTask.createdAt)}
                                </h1>
                            </div>
                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            <Clock className="h-4 text-[#E94C4C]" />
                            <Label htmlFor="user" className="text-right text-sm">
                                Due Date
                            </Label>
                            <div className="flex gap-2 ml-5 justify-start">
                                <h1 id="assignedUser" className="col-span-3  text-xs ">
                                    {formatTaskDate(selectedTask.dueDate)}
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4">
                            <RepeatIcon className="h-4 text-[#0D751C]" />
                            <Label htmlFor="user" className="text-right text-sm">
                                Frequency
                            </Label>
                            <div className="flex gap-2 ml-3  justify-start">
                                {/* <Repeat className="h-5" /> */}
                                <h1 id="assignedUser" className="col-span-3 text-xs">
                                    {selectedTask.repeatType ? selectedTask.repeatType : "Once"}
                                </h1>
                                {selectedTask.repeatType && (
                                    <div className="ml-2">
                                        {selectedTask.dates && selectedTask.dates.length > 0 ? (
                                            <h1>{selectedTask.dates.join(', ')}</h1>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className=" flex items-center gap-1 mt-4">
                            {selectedTask.status === 'Pending' && <Circle className="h-4 text-red-500" />}
                            {selectedTask.status === 'Completed' && <CheckCircle className="h-4 text-green-500" />}
                            {selectedTask.status === 'In Progress' && <Loader className="h-4 text-orange-500" />}
                            <Label htmlFor="user" className="text-right text-sm">
                                Status
                            </Label>
                            <div className="flex gap-2 ml-9  justify-start">

                                <h1 id="assignedUser" className="col-span-3 text-xs ml-1 ">
                                    {`${selectedTask.status}`}
                                </h1>
                            </div>
                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            <Tag className="h-4 text-[#C3AB1E]" />
                            <Label htmlFor="user" className="text-right text-sm">
                                Category
                            </Label>
                            <div className="flex  ml-6  justify-start">
                                <h1 id="assignedUser" className="col-span-3 text-xs">
                                    {selectedTask.category?.name}
                                </h1>
                            </div>
                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            {selectedTask.priority === 'High' && <Flag className="h-4 text-red-500" />}
                            {selectedTask.priority === 'Medium' && <Flag className="h-4 text-orange-500" />}
                            {selectedTask.priority === 'Low' && <Flag className="h-4 text-green-500" />}
                            <Label htmlFor="user" className="text-right">
                                Priority
                            </Label>
                            <div className="flex gap-2 ml-9  justify-start">
                                <h1 id="assignedUser" className={`col-span-3 text-xs  font-bold ${selectedTask.priority === 'High'
                                    ? 'text-red-500'
                                    : selectedTask.priority === 'Medium'
                                        ? 'text-orange-500'
                                        : selectedTask.priority === 'Low'
                                            ? 'text-green-500'
                                            : ''
                                    }`}>
                                    {`${selectedTask.priority}`}
                                </h1>
                            </div>

                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            <FileTextIcon className="h-4 text-[#4662D2]" />
                            <Label htmlFor="user" className="text-right text-sm">
                                Description
                            </Label>
                            <div className="flex gap-2 ml-2  justify-start">

                                <h1 id="assignedUser" className="col-span-3 text-xs ">
                                    {`${selectedTask.description}`}
                                </h1>
                            </div>
                        </div>
                        <Separator className="mt-4   " />
                        <div className="flex p-4 gap-2">
                            <h1 className="text-sm  ">Links</h1>
                            <div className='h-6 w-6 rounded-full items-center text-center border cursor-pointer shadow-white shadow-sm  bg-[#282D32] '>
                                <Link className='h-4 text-center m-auto mt-1' />
                            </div>
                        </div>
                        <div className="">
                            {selectedTask.links && selectedTask.links.filter(link => link.trim() !== "").length > 0 ? (
                                selectedTask.links.map((link, index) => (
                                    <div key={index} className="flex justify-between w-full space-x-2 my-2">
                                        <div className="flex justify-between w-full text-sm">
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ">
                                                {link}
                                            </a>
                                            <div>
                                                <CopyToClipboard text={link} onCopy={() => handleCopy(link)}>
                                                    <button className="px-2 py-2"><IconCopy className="h-4 text-white" /></button>
                                                </CopyToClipboard>
                                                <a href={link} target="_blank" rel="noopener noreferrer">
                                                    <button className="px-2 py-1"><GlobeIcon className="h-4 text-white" /></button>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs p-4">No links attached.</p>
                            )}
                        </div>
                        <Separator className="mt-4   " />
                        <div className="flex p-4 gap-2">
                            <h1 className=" text-sm ">Files</h1>
                            <div className="bg-green-600 h-6 w-6 text-center items-center rounded-full">
                                <File className="h-4 mt-1 text-center" />
                            </div>
                        </div>
                        <div className="px-4">
                            {selectedTask.attachment && selectedTask.attachment.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {selectedTask.attachment.map((url: string, index: number) => {
                                        // Extract the filename after the last '-' in the URL
                                        const fileName = url.split('/').pop()?.split('-').pop() || 'Unknown file';

                                        return (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 text-sm underline"
                                                download={fileName}
                                            >
                                                {fileName}
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <Separator className="mt-4  " />
                        <div className="flex p-4 gap-2">
                            <h1 className="  ">Reminders</h1>
                            <div className="bg-red-600 h-6 w-6 rounded-full">
                                <Bell className="h-4 mt-1" />
                            </div>

                        </div>
                        <div className="px-4">
                            {selectedTask.reminder ? (
                                <div className="flex flex-col gap-2">
                                    {(selectedTask.reminder.email?.value ?? 0) > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">
                                                <MailIcon className='h-5' />
                                            </span>
                                            <span>
                                                {`${selectedTask.reminder.email?.value ?? 0} ${selectedTask.reminder.email?.type ?? ''}`}
                                            </span>
                                        </div>
                                    )}
                                    {(selectedTask.reminder.whatsapp?.value ?? 0) > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold"><img src='/whatsapp.png' className='h-6' /></span>
                                            <span>
                                                {`${selectedTask.reminder.whatsapp?.value ?? 0} ${selectedTask.reminder.whatsapp?.type ?? ''} `}
                                            </span>
                                        </div>
                                    )}
                                    {!(
                                        (selectedTask.reminder.email?.value ?? 0) > 0 ||
                                        (selectedTask.reminder.whatsapp?.value ?? 0) > 0
                                    ) && (
                                            <p className='text-xs p-4'>No reminders set</p>
                                        )}
                                </div>
                            ) : (
                                <p className='text-xs '>No reminders set.</p>
                            )}
                        </div>



                        <div className="">
                            {selectedTask.audioUrl && (
                                <CustomAudioPlayer audioUrl={selectedTask.audioUrl} />
                            )}
                        </div>

                        <div className="gap-2 w-1/2 px-4 mt-4 mb-4 flex">
                            {selectedTask.status === "Completed" ? (
                                <>
                                    <Button
                                        onClick={() => {
                                            setStatusToUpdate("Reopen"); // Assuming 'In Progress' status is used for reopening
                                            setIsReopenDialogOpen(true);
                                        }}
                                        className="gap-2 border bg-transparent hover:shadow-sm hover:shadow-yellow-500 hover:bg-transparent border-gray-600 w-fit"
                                    >
                                        <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                                        Reopen
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteClick(selectedTask._id)}
                                        className="border bg-transparent hover:shadow-sm hover:shadow-red-500 hover:bg-transparent border-gray-600 w-fit "
                                    >
                                        <Trash className="h-4 rounded-full text-red-400" />
                                        Delete
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => {
                                            setStatusToUpdate("In Progress");
                                            setIsDialogOpen(true);
                                        }}
                                        className="gap-2 border bg-transparent hover:shadow-sm hover:shadow-orange-500 hover:bg-transparent border-gray-600 w-full"
                                    >
                                        <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                                        In Progress
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setStatusToUpdate("Completed");
                                            setIsCompleteDialogOpen(true);
                                        }}
                                        className="border bg-transparent hover:shadow-sm hover:shadow-green-500 hover:bg-transparent border-gray-600 w-full"
                                    >
                                        <CheckCheck className="h-4 rounded-full text-green-400" />
                                        Completed
                                    </Button>
                                    <Button
                                        onClick={handleEditClick}
                                        className="border bg-transparent hover:shadow-sm hover:shadow-blue-500 hover:bg-transparent border-gray-600 w-full"
                                    >
                                        <Edit className="h-4 rounded-full text-blue-400" />
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteClick(selectedTask._id)}
                                        className="border rounded hover:shadow-sm hover:shadow-red-500 hover:bg-transparent bg-transparent border-gray-600 w-full"
                                    >
                                        <Trash className="h-4 rounded-full text-red-400 " />
                                        Delete
                                    </Button>
                                </>
                            )}

                            {/* Edit Task Dialog */}
                            <EditTaskDialog
                                open={isEditDialogOpen}
                                onClose={() => setIsEditDialogOpen(false)}
                                task={selectedTask as Task}
                                users={users}
                                categories={categories}
                                onTaskUpdate={onTaskUpdate}
                            />
                        </div>

                    </div>

                    <Separator />
                    <div className=" rounded-xl bg-[#] p-4 mt-4 mb-4">
                        <div className="mb-4 gap-2 flex justify-start ">
                            <CheckCheck className="h-5" />
                            <Label className=" text-md mt-auto">Task Updates</Label>

                        </div>
                        <div className="space-y-2 h-full">
                            {sortedComments && sortedComments.length > 0 ? (
                                sortedComments.map((commentObj, index) => (
                                    <div key={index} className="relative border bg-[#121212] rounded-lg p-2">
                                        <div className="flex gap-2 items-center">
                                            <div className="h-6 w-6 text-xs  text-center rounded-full bg-red-700">

                                                <h1 className='mt-1'>
                                                    {commentObj.userName.slice(0, 1)}
                                                </h1>
                                            </div>
                                            <strong>{commentObj.userName}</strong>
                                        </div>
                                        <p className="px-2 ml-6 text-xs">{formatDate(commentObj.createdAt)}</p>
                                        <p className="p-2 text-sm ml-6">{commentObj.comment}</p>

                                        {/* Render fileUrl if it exists */}
                                        {commentObj.fileUrl && commentObj.fileUrl.length > 0 && (
                                            <div className="ml-6 mt-2">
                                                {commentObj.fileUrl.map((url, fileIndex) => (
                                                    <div key={fileIndex} className="mb-2">
                                                        {url.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                                            <img
                                                                src={url}
                                                                alt={`Attachment ${fileIndex}`}
                                                                className="max-w-full h-auto rounded-lg"
                                                            />
                                                        ) : (
                                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs ml-2">
                                                                View File
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {commentObj.tag && (
                                            <div
                                                className={`absolute top-0 right-0 m-4 text-xs text-white px-2 py-1 rounded ${commentObj.tag === 'In Progress'
                                                    ? 'bg-orange-600'
                                                    : commentObj.tag === 'Completed'
                                                        ? 'bg-green-500'
                                                        : commentObj.tag === 'Reopen'
                                                            ? 'bg-red-500'
                                                            : ''
                                                    }`}
                                            >
                                                {commentObj.tag}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-white mt-6 -500">
                                    <div className='flex mt-4 justify-center'>
                                        <Bell className='mt-2' />
                                    </div>
                                    <h1 className='mt-1'>
                                        No Activity
                                    </h1>
                                    <p className='text-xs mt-1'>It seems that you dont have any recent activity for this task.</p>
                                </div>
                            )}
                        </div>


                    </div>

                    <SheetFooter>

                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default TaskDetails;