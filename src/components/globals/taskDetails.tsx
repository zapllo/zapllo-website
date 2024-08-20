import React, { Dispatch, SetStateAction } from 'react'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';
import { Separator } from '../ui/separator';
import { UpdateIcon } from '@radix-ui/react-icons';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { ArrowLeft, Bell, Calendar, CheckCheck, CheckCircle, Circle, Clock, Edit, File, FileTextIcon, Flag, GlobeIcon, Link, Loader, PlayIcon, Repeat, RepeatIcon, Tag, Trash } from 'lucide-react';
import EditTaskDialog from './editTask';
import CopyToClipboard from 'react-copy-to-clipboard';
import { IconCopy } from '@tabler/icons-react';

type Props = {}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    organization: string;
    email: string;
    role: string;
}


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
    dates?: string[];
    categories?: string[];
    dueDate: string;
    completionDate: string;
    attachment?: string;
    links?: string[];
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
    handleCopy: (link: string) => void;
    setSelectedTask: (task: Task | null) => void;
    setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
    setIsReopenDialogOpen: Dispatch<SetStateAction<boolean>>;
    isEditDialogOpen: boolean;
    setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
    setIsCompleteDialogOpen: Dispatch<SetStateAction<boolean>>;
    setStatusToUpdate: Dispatch<SetStateAction<string | null>>; // Update the type here
    formatTaskDate: (dateTimeString: string) => string;
    users: User[];
    sortedComments?: Comment[];
    categories: Category[];
    formatDate: (dateTimeString: string) => string;
}



const TaskDetails: React.FC<TaskDetailsProps> = ({ selectedTask,
    onTaskUpdate,
    onClose,
    handleUpdateTaskStatus,
    handleDelete,
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
    sortedComments,
    formatDate,
    categories,
    formatTaskDate, }) => {
    return (
        <div>
            <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                <SheetContent className="max-w-4xl w-full ">
                    <SheetHeader>
                        <div className="flex gap-2">
                            <ArrowLeft className="cursor-pointer" onClick={() => setSelectedTask(null)} />
                            <SheetTitle className="text-white mb-4">
                                Task details
                            </SheetTitle>
                        </div>


                    </SheetHeader>
                    <div className="border overflow-y-scroll scrollbar-hide  h-10/11 p-4 rounded-lg">
                        <h1 className="font-bold text-xl">{selectedTask.title}</h1>

                        <div className="flex mt-4 justify-start space-x-12  text-start items-center gap-6">
                            <div className="flex items-center gap-4">
                                <Label htmlFor="user" className="text-right">
                                    Assigned To
                                </Label>
                                {selectedTask?.assignedUser?.firstName ? (
                                    <div className="flex gap-2 justify-start">
                                        <div className="h-6 w-6 rounded-full bg-primary -400">
                                            <h1 className="text-center uppercase">
                                                {`${selectedTask?.assignedUser?.firstName?.slice(0, 1)}`}
                                            </h1>
                                        </div>
                                        <h1 id="assignedUser" className="col-span-3">{`${selectedTask.assignedUser.firstName} ${selectedTask.assignedUser.lastName}`}</h1>

                                    </div>
                                ) : null}
                            </div>
                            <div className=" flex items-center gap-4">
                                <Label htmlFor="user" className="text-right">
                                    Assigned By
                                </Label>
                                {selectedTask?.user?.firstName ? (
                                    <div className="flex gap-2 justify-start">
                                        <div className="h-6 w-6 rounded-full bg-[#4F2A2B]">
                                            <h1 className="text-center uppercase">
                                                {selectedTask.user.firstName.slice(0, 1)}
                                            </h1>
                                        </div>
                                        <h1 id="assignedUser" className="col-span-3">
                                            {`${selectedTask.user.firstName} ${selectedTask.user.lastName}`}
                                        </h1>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            {/* <Clock className="h-5 text-[#E94C4C]" />
     */}
                            <Calendar className="h-5 text-[#E94C4C]" />

                            <Label htmlFor="user" className="text-right">
                                Created At
                            </Label>
                            <div className="flex gap-2 ml-2  justify-start">
                                {/* <Calendar className="h-5" /> */}

                                <h1 id="assignedUser" className="col-span-3 font-">
                                    {formatTaskDate(selectedTask.createdAt)}
                                </h1>
                            </div>
                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            <Clock className="h-5 text-[#E94C4C]" />
                            <Label htmlFor="user" className="text-right">
                                Due Date
                            </Label>
                            <div className="flex gap-2 ml-4 justify-start">
                                <h1 id="assignedUser" className="col-span-3   ">
                                    {formatTaskDate(selectedTask.dueDate)}
                                </h1>
                            </div>
                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            <RepeatIcon className="h-5 text-[#0D751C]" />
                            <Label htmlFor="user" className="text-right">
                                Frequency
                            </Label>
                            <div className="flex gap-2 ml-2  justify-start">
                                <Repeat className="h-5" />
                                <h1 id="assignedUser" className="col-span-3 ">
                                    {`${selectedTask.repeatType}`}
                                </h1>
                                <div className="ml-2">
                                    {selectedTask?.dates?.length && selectedTask.dates.length > 0 ? (
                                        <h1 className="">
                                            ({selectedTask?.dates?.join(', ')})
                                        </h1>
                                    ) : (
                                        <p>No specific dates selected.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className=" flex items-center gap-1 mt-4">
                            {selectedTask.status === 'Pending' && <Circle className="h-5 text-red-500" />}
                            {selectedTask.status === 'Completed' && <CheckCircle className="h-5 text-green-500" />}
                            {selectedTask.status === 'In Progress' && <Loader className="h-5 text-orange-500" />}
                            <Label htmlFor="user" className="text-right">
                                Status
                            </Label>
                            <div className="flex gap-2 ml-8  justify-start">

                                <h1 id="assignedUser" className="col-span-3 ">
                                    {`${selectedTask.status}`}
                                </h1>
                            </div>
                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            <Tag className="h-5 text-[#C3AB1E]" />
                            <Label htmlFor="user" className="text-right">
                                Category
                            </Label>
                            <div className="flex  ml-3  justify-start">
                                <h1 id="assignedUser" className="col-span-3 ">
                                    {selectedTask.category.name}
                                </h1>
                            </div>
                        </div>
                        <div className=" flex items-center gap-1 mt-4">
                            {selectedTask.priority === 'High' && <Flag className="h-5 text-red-500" />}
                            {selectedTask.priority === 'Medium' && <Flag className="h-5 text-orange-500" />}
                            {selectedTask.priority === 'Low' && <Flag className="h-5 text-green-500" />}
                            <Label htmlFor="user" className="text-right">
                                Priority
                            </Label>
                            <div className="flex gap-2 ml-6  justify-start">

                                <h1 id="assignedUser" className={`col-span-3 font-bold ${selectedTask.priority === 'High'
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
                            <FileTextIcon className="h-5 text-[#4662D2]" />
                            <Label htmlFor="user" className="text-right">
                                Description
                            </Label>
                            <div className="flex gap-2 ml-2  justify-start">

                                <h1 id="assignedUser" className="col-span-3 ">
                                    {`${selectedTask.description}`}
                                </h1>
                            </div>
                        </div>
                        <Separator className="mt-4   " />
                        <div className="flex p-4 gap-2">
                            <h1 className="  ">Links</h1>
                            <div className="bg-blue-500 h-6 w-6 rounded-full">
                                <Link className="h-4 mt-1" />
                            </div>

                        </div>
                        <div className="px-4">
                            {selectedTask.links?.map((link, index) => (
                                <div key={index} className="flex justify-between w-full space-x-2 my-2">
                                    <div className="flex justify-between w-full">
                                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ">
                                            {link}
                                        </a>
                                        <div>
                                            <CopyToClipboard text={link} onCopy={() => handleCopy(link)}>
                                                <button className="px-2 py-2   "><IconCopy className="h-5 text-white" /></button>
                                            </CopyToClipboard>
                                            <a href={link} target="_blank" rel="noopener noreferrer">
                                                <button className="px-2 py-1 "><GlobeIcon className="h-5 text-white" /></button>
                                            </a>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                        <Separator className="mt-4   " />
                        <div className="flex p-4 gap-2">
                            <h1 className="  ">Files</h1>
                            <div className="bg-green-600 h-6 w-6 rounded-full">
                                <File className="h-4 mt-1" />
                            </div>

                        </div>
                        <div className="px-4">
                            {/* {task.links?.map((link, index) => (
        <div key={index} className="flex justify-between w-full space-x-2 my-2">
          <div className="flex justify-between w-full">
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ">
              {link}
            </a>
            <div>
              <CopyToClipboard text={link} onCopy={() => handleCopy(link)}>
                <button className="px-2 py-2   "><IconCopy className="h-5 text-white" /></button>
              </CopyToClipboard>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <button className="px-2 py-1 "><GlobeIcon className="h-5 text-white" /></button>
              </a>
            </div>
          </div>

        </div>
      ))} */}
                        </div>
                        <Separator className="mt-4  " />
                        <div className="flex p-4 gap-2">
                            <h1 className="  ">Reminders</h1>
                            <div className="bg-red-600 h-6 w-6 rounded-full">
                                <Bell className="h-4 mt-1" />
                            </div>

                        </div>
                        <div className="px-4">

                        </div>
                        <div className="gap-2 w-1/2 mt-4 mb-4 flex">
                            {selectedTask.status === "Completed" ? (
                                <>
                                    <Button
                                        onClick={() => {
                                            setStatusToUpdate("Reopen"); // Assuming 'In Progress' status is used for reopening
                                            setIsReopenDialogOpen(true);
                                        }}
                                        className="gap-2 border bg-transparent border-gray-600 w-full"
                                    >
                                        <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                                        Reopen
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(selectedTask._id)}
                                        className="border bg-transparent border-gray-600 w-full"
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
                                        className="gap-2 border bg-transparent border-gray-600 w-full"
                                    >
                                        <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                                        In Progress
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setStatusToUpdate("Completed");
                                            setIsCompleteDialogOpen(true);
                                        }}
                                        className="border bg-transparent border-gray-600 w-full"
                                    >
                                        <CheckCheck className="h-4 rounded-full text-green-400" />
                                        Completed
                                    </Button>
                                    <Button
                                        onClick={handleEditClick}
                                        className="border bg-transparent border-gray-600 w-full"
                                    >
                                        <Edit className="h-4 rounded-full text-blue-400" />
                                        Edit
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
                            <UpdateIcon className="h-5" />
                            <Label className=" text-md mt-auto">Task Updates</Label>

                        </div>
                        <div className="space-y-2    h-full">
                            {sortedComments?.map((commentObj, index) => (
                                <div key={index} className="relative rounded-lg p-2">
                                    <div className="flex gap-2 items-center">
                                        <div className="h-6 w-6 text-lg text-center rounded-full bg-red-700">
                                            {`${commentObj.userName}`.slice(0, 1)}
                                        </div>
                                        <strong>{commentObj.userName}</strong>
                                    </div>
                                    <p className="px-2 ml-6 text-xs"> {formatDate(commentObj.createdAt)}</p>

                                    <p className="p-2 text-sm ml-6">{commentObj.comment}</p>
                                    {commentObj.status && (
                                        <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 rounded-lg">
                                            {commentObj.status}
                                        </div>
                                    )}
                                </div>
                            ))}
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