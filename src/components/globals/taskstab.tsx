import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardAnalytics from "@/components/globals/dashboardAnalytics";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCheck, FileWarning, User as UserIcon, User, Search, Bell, User2, Clock, Repeat, Circle, CheckCircle, Loader, Calendar, Flag, FlagIcon, Edit, Delete, Trash } from "lucide-react";
import { IconClock } from "@tabler/icons-react";
import { PlayIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import axios from "axios";

// Define the User interface
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  organization: string;
}

// Define the Task interface
interface Task {
  _id: string;
  title: string;
  user: User;
  description: string;
  assignedUser: User;
  category: string;
  priority: string;
  repeatType?: string;
  repeat: boolean;
  days?: string[];
  categories?: string[];
  dueDate: string;
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
type TaskUpdateCallback = (updatedTask: Task) => void;

interface TasksTabProps {
  tasks: Task[] | null;
  currentUser: User;
  onTaskUpdate: TaskUpdateCallback;
  onTaskDelete: (taskId: string) => void;

}

export default function TasksTab({ tasks, currentUser, onTaskUpdate }: TasksTabProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State variables for filters
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [repeatFilter, setRepeatFilter] = useState<boolean | null>(null);
  const [assignedUserFilter, setAssignedUserFilter] = useState<string | null>(null);
  const [dueDateFilter, setDueDateFilter] = useState<string | null>(null);
  // State variables for modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/organization');
        const result = await response.json();

        if (response.ok) {
          setUsers(result.data);
        } else {
          console.error('Error fetching users:', result.error);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);


  // Function to filter tasks based on selected filters and search query
  const filteredTasks = tasks?.filter(task => {
    let isFiltered = true;

    // Filter based on active tab
    if (activeTab === "myTasks") {
      isFiltered = task.assignedUser._id === currentUser._id || task.user._id === currentUser._id;
    } else if (activeTab === "delegatedTasks") {
      isFiltered = task.user._id === currentUser._id && task.assignedUser._id !== currentUser._id;
    } else if (activeTab === "allTasks") {
      isFiltered = task.user.organization === currentUser.organization;
    }

    // Apply other filters
    if (isFiltered && priorityFilter) {
      isFiltered = task.priority === priorityFilter;
    }

    if (isFiltered && repeatFilter !== null) {
      isFiltered = task.repeat === repeatFilter;
    }

    if (isFiltered && assignedUserFilter) {
      isFiltered = task.assignedUser._id === assignedUserFilter;
    }

    if (isFiltered && dueDateFilter) {
      isFiltered = task.dueDate === dueDateFilter;
    }

    // Apply search query filter globally
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      isFiltered = (
        task.title.toLowerCase().includes(lowerCaseQuery) ||
        task.description.toLowerCase().includes(lowerCaseQuery) ||
        task.user.firstName.toLowerCase().includes(lowerCaseQuery) ||
        task.user.lastName.toLowerCase().includes(lowerCaseQuery) ||
        task.assignedUser.firstName.toLowerCase().includes(lowerCaseQuery) ||
        task.assignedUser.lastName.toLowerCase().includes(lowerCaseQuery) ||
        task.status.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return isFiltered;
  });

  const handleUpdateTaskStatus = async () => {
    if (!selectedTask || !statusToUpdate) return;

    try {
      const response = await fetch('/api/tasks/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedTask._id,
          status: statusToUpdate,
          comment,
          userName: `${currentUser.firstName} `,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onTaskUpdate(result.task); // Call the callback function to update the task
        setIsDialogOpen(false);
        setSelectedTask(null);
      } else {
        console.error('Error updating task:', result.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };




  if (tasks === null) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Skeleton className="h-12  w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md mt-4" />
        <Skeleton className="h-12 w-full rounded-md mt-4" />
      </div>
    );
  }

  const formatDate = (dateTimeString: string) => {
    const dateTime = new Date(dateTimeString);
    const now = new Date();

    // Calculate difference in milliseconds
    const diffMs = now.getTime() - dateTime.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    // Display "a moment ago" if less than 1 minute ago
    if (diffMinutes < 1) {
      return "a moment ago";
    }

    // Display "today" if within the same day
    if (
      dateTime.getDate() === now.getDate() &&
      dateTime.getMonth() === now.getMonth() &&
      dateTime.getFullYear() === now.getFullYear()
    ) {
      const hours = ('0' + dateTime.getHours()).slice(-2);
      const minutes = ('0' + dateTime.getMinutes()).slice(-2);
      return `Today at ${hours}:${minutes}`;
    }

    // Display date if older than today
    const day = ('0' + dateTime.getDate()).slice(-2);
    const month = ('0' + (dateTime.getMonth() + 1)).slice(-2);
    const year = dateTime.getFullYear();
    return `${day}-${month}-${year}`;
  };



  const handleDelete = async (taskId: string) => {
    try {
      await axios.delete('/api/tasks/delete', {
        data: { id: selectedTask?._id },
      });
      // Optionally, handle success (e.g., show a message, update state)
      console.log('Task deleted successfully');
    } catch (error: any) {
      // Handle error (e.g., show an error message)
      console.error('Failed to delete task:', error.message);
    }
  };



  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex px-4 mt-2 space-x-2 items-center mb-6">
        <Search />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border rounded-md w-full"
        />
      </div>
      <div className="flex items-center justify-between mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex gap-4">
            <TabsTrigger value="all">Dashboard</TabsTrigger>
            <TabsTrigger value="myTasks">My Tasks</TabsTrigger>
            <TabsTrigger value="delegatedTasks">Delegated Tasks</TabsTrigger>
            <TabsTrigger value="allTasks">All Tasks</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex gap-4 mb-4">
        {/* Dropdown filters - render only if activeTab is not "all" */}
        {activeTab !== "all" && (
          <>
            <div className="space-x-2 bg-gray-400 px-4 py-1 rounded">
              <Label>Priority:</Label>
              <select className="rounded px-4" onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="space-x-2 bg-gray-400 px-4 py-1 rounded">
              <Label>Repeat:</Label>
              <select className="rounded px-4" onChange={(e) => setRepeatFilter(e.target.value === 'true')}>
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="space-x-2 bg-gray-400 px-4 py-1 rounded">
              <Label>Assigned User:</Label>
              <select className="px-4 rounded" onChange={(e) => setAssignedUserFilter(e.target.value)}>
                <option value="">All</option>
                {/* Assuming you have a list of users to choose from */}
                {users.map(user => (
                  <option key={user._id} value={user._id}>{`${user.firstName}`}</option>
                ))}
              </select>
            </div>
            <div className="space-x-2 bg-gray-400 px-4 py-1 rounded">
              <Label>Due Date:</Label>
              <select className=" rounded" onChange={(e) => setDueDateFilter(e.target.value)}>
                <option value="">All</option>
                {/* Assuming you have a list of due dates to choose from */}
                {tasks.map(task => (
                  <option key={task._id} value={task.dueDate}>
                    {new Date(task.dueDate).toLocaleDateString('en-GB')}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {activeTab === "all" ? (
        <div>
          <DashboardAnalytics />
        </div>
      ) : (
        <div className="grid text-sm gap-4">
          {filteredTasks?.map((task) => (
            <div key={task._id}>
              <Card
                className="flex items-center justify-between cursor-pointer p-4"
                onClick={() => setSelectedTask(task)}
              >
                <div className=" items-center gap-4">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-muted-foreground">Assigned by {task.user.firstName}</p>
                  </div>
                  <Badge className="mt-1"><IconClock className="h-5" /> {new Date(task.dueDate).toLocaleDateString()}</Badge>
                </div>
                <div className="">
                  <div className="gap-2 flex">
                    <div className="bg-gray-700 rounded px-4 flex gap-2 py-1">
                      <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                      <h1>
                        In Progress
                      </h1>
                    </div>
                    <div className="bg-gray-700 rounded px-4 flex gap-2 py-1">
                      <CheckCheck className="h-4  rounded-full text-green-400" />
                      <h1>
                        Mark as Completed
                      </h1>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <div className="flex">
                      <UserIcon className="h-5" />
                      {task.assignedUser.firstName}
                    </div>
                    <div className="flex">
                      <FileWarning className="h-5 " />
                      <h1 className="mt-auto">
                        {task.status}
                      </h1>
                    </div>
                  </div>
                </div>
              </Card>
              {isDialogOpen && (
                <Dialog
                  open={isDialogOpen}
                  onOpenChange={() => setIsDialogOpen(false)}
                >
                  <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
                  <DialogContent className="bg-white rounded-lg p-6 mx-auto mt-20 max-w-sm">
                    <DialogTitle>Update Task</DialogTitle>
                    <div className="mt-4">
                      <Label>Comment</Label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="border rounded-lg px-2 py-1 w-full mt-2"
                      />
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        onClick={() => setIsDialogOpen(false)}
                        className="bg-gray-500 text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateTaskStatus}
                        className="bg-blue-500 text-white"
                      >
                        Update Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {selectedTask && selectedTask._id === task._id && (
                <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                  <SheetContent className="max-w-4xl w-full">
                    <SheetHeader>
                      <SheetTitle className="text-muted-foreground">
                        Task details
                      </SheetTitle>
                      <SheetDescription className="font-bold text-lg text-white">Title:  {selectedTask.title}</SheetDescription>
                    </SheetHeader>
                    <div className="flex mt-4 justify-start space-x-12  text-start items-center gap-6">
                      <div className="flex items-center gap-4">
                        <Label htmlFor="user" className="text-right">
                          Assigned To
                        </Label>
                        <div className="flex gap-2 justify-start">
                          <div className="h-6 w-6 rounded-full bg-primary -400">
                            <h1 className="text-center uppercase">
                              {`${selectedTask.assignedUser.firstName.slice(0, 1)}`}
                            </h1>
                          </div>
                          <h1 id="assignedUser" className="col-span-3">{`${selectedTask.assignedUser.firstName} ${selectedTask.assignedUser.lastName}`}</h1>

                        </div>
                      </div>
                      <div className=" flex items-center gap-4">
                        <Label htmlFor="user" className="text-right">
                          Assigned By
                        </Label>
                        <div className="flex gap-2 justify-start">
                          <div className="h-6 w-6 rounded-full bg-primary -400">
                            <h1 className="text-center uppercase">
                              {`${selectedTask.user.firstName.slice(0, 1)}`}
                            </h1>
                          </div>
                          <h1 id="assignedUser" className="col-span-3">{`${selectedTask.user.firstName} ${selectedTask.user.lastName}`}</h1>

                        </div>
                      </div>

                    </div>
                    <div className=" flex items-center gap-4 mt-4">
                      <Label htmlFor="user" className="text-right">
                        Created At
                      </Label>
                      <div className="flex gap-2 ml-2  justify-start">
                        <Calendar className="h-5" />

                        <h1 id="assignedUser" className="col-span-3 font-bold">
                          {`${new Date(selectedTask.createdAt).getDate().toString().padStart(2, '0')}-${(new Date(selectedTask.createdAt).getMonth() + 1).toString().padStart(2, '0')}-${new Date(selectedTask.createdAt).getFullYear()}`}
                        </h1>
                      </div>
                    </div>
                    <div className=" flex items-center gap-4 mt-4">
                      <Label htmlFor="user" className="text-right">
                        Due Date
                      </Label>
                      <div className="flex gap-2 ml-4 justify-start">
                        <Clock className="h-5" />
                        <h1 id="assignedUser" className="col-span-3  font-bold ">
                          {`${new Date(selectedTask.dueDate).getDate().toString().padStart(2, '0')}-${(new Date(selectedTask.createdAt).getMonth() + 1).toString().padStart(2, '0')}-${new Date(selectedTask.createdAt).getFullYear()}`}
                        </h1>
                      </div>
                    </div>
                    <div className=" flex items-center gap-4 mt-4">
                      <Label htmlFor="user" className="text-right">
                        Frequency
                      </Label>
                      <div className="flex gap-2 ml-2  justify-start">
                        <Repeat className="h-5" />
                        <h1 id="assignedUser" className="col-span-3 font-bold">
                          {`${selectedTask.repeatType}`}
                        </h1>
                      </div>
                    </div>

                    <div className=" flex items-center gap-4 mt-4">
                      <Label htmlFor="user" className="text-right">
                        Status
                      </Label>
                      <div className="flex gap-2 ml-8  justify-start">
                        {selectedTask.status === 'Pending' && <Circle className="h-5 text-red-500" />}
                        {selectedTask.status === 'Completed' && <CheckCircle className="h-5 text-green-500" />}
                        {selectedTask.status === 'In Progress' && <Loader className="h-5 text-orange-500" />}
                        <h1 id="assignedUser" className="col-span-3 font-bold">
                          {`${selectedTask.status}`}
                        </h1>
                      </div>
                    </div>
                    <div className=" flex items-center gap-4 mt-4">
                      <Label htmlFor="user" className="text-right">
                        Category
                      </Label>
                      <div className="flex gap-2 ml-4  justify-start">

                        <h1 id="assignedUser" className="col-span-3 font-bold">
                          {`${selectedTask.category}`}
                        </h1>
                      </div>
                    </div>
                    <div className=" flex items-center gap-4 mt-4">
                      <Label htmlFor="user" className="text-right">
                        Priority
                      </Label>
                      <div className="flex gap-2 ml-6  justify-start">
                        {selectedTask.priority === 'High' && <Flag className="h-5 text-red-500" />}
                        {selectedTask.priority === 'Medium' && <Flag className="h-5 text-orange-500" />}
                        {selectedTask.priority === 'Low' && <Flag className="h-5 text-green-500" />}
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
                    <div className=" flex items-center gap-4 mt-4">
                      <Label htmlFor="user" className="text-right">
                        Description
                      </Label>
                      <div className="flex gap-2 ml-2  justify-start">

                        <h1 id="assignedUser" className="col-span-3 font-bold">
                          {`${selectedTask.description}`}
                        </h1>
                      </div>
                    </div>
                    <div className="gap-2 w-1/2 mt-4 mb-4 flex">
                      <Button
                        onClick={() => {
                          setStatusToUpdate("In Progress");
                          setIsDialogOpen(true);
                        }}
                        className="gap-2 bg-gray-600 w-full"
                      >
                        <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                        In Progress
                      </Button>
                      <Button
                        onClick={() => {
                          setStatusToUpdate("Completed");
                          setIsDialogOpen(true);
                        }}
                        className="bg-gray-600 w-full "
                      >
                        <CheckCheck className="h-4 rounded-full text-green-400" />
                        Completed
                      </Button>
                      <Button
                        onClick={() => {
                          setStatusToUpdate("Completed");
                          setIsDialogOpen(true);
                        }}
                        className="bg-gray-600 w-full"
                      >
                        <Edit className="h-4 rounded-full text-blue-400" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(selectedTask._id)}
                        className="bg-gray-600 w-full"
                      >
                        <Trash className="h-4 rounded-full text-red-400" />
                        Delete
                      </Button>
                    </div>
                    {/* <div className="grid gap-2  p-4 rounded-xl text-xs  grid-cols-1 py-2">
                      <div className="grid grid-cols-4  items-center gap-2">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <h1 id="title" className="col-span-3">{selectedTask.title}</h1>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <h1 id="description" className="col-span-3">{selectedTask.description}</h1>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="categories" className="text-right">
                          Category
                        </Label>
                        <h1 id="categories" className="col-span-3">{selectedTask.categories.join(', ')}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="priority" className="text-right">
                          Priority
                        </Label>
                        <h1 id="priority" className="col-span-3">{selectedTask.priority}</h1>
                      </div>
                      {selectedTask.repeatType && (
                        <div className="grid grid-cols-4 items-center gap-2">
                          <Label htmlFor="repeatType" className="text-right">
                            Repeat Type
                          </Label>
                          <h1 id="repeatType" className="col-span-3">{selectedTask.repeatType}</h1>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="repeat" className="text-right">
                          Repeat
                        </Label>
                        <h1 id="repeat" className="col-span-3">{selectedTask.repeat ? 'Yes' : 'No'}</h1>
                      </div>
                      {selectedTask.days && selectedTask.days.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-2">
                          <Label htmlFor="days" className="text-right">
                            Days
                          </Label>
                          <h1 id="days" className="col-span-3">{selectedTask.days.join(', ')}</h1>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <h1 id="dueDate" className="col-span-3">{new Date(selectedTask.dueDate).toLocaleDateString()}</h1>
                      </div>
                      {selectedTask.attachment && (
                        <div className="grid grid-cols-4 items-center gap-2">
                          <Label htmlFor="attachment" className="text-right">
                            Attachment
                          </Label>
                          <h1 id="attachment" className="col-span-3">{selectedTask.attachment}</h1>
                        </div>
                      )}
                      {selectedTask.links && selectedTask.links.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-2">
                          <Label htmlFor="links" className="text-right">
                            Links
                          </Label>
                          <h1 id="links" className="col-span-3">{selectedTask.links.join(', ')}</h1>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <h1 id="status" className="col-span-3">{selectedTask.status}</h1>
                      </div>
                    </div> */}
                    <Separator />
                    <div className=" rounded-xl p-2 mt-4 mb-4">
                      <div className="mb-4 gap-2 flex justify-start ">
                        <UpdateIcon className="h-5" />
                        <Label className=" text-md mt-auto">Task Updates</Label>

                      </div>
                      <div className="space-y-2">
                        {selectedTask.comments.map((commentObj, index) => (
                          <div key={index} className="border rounded-lg p-2">
                            <div className="flex items-center">
                              <UserIcon className="h-5 mr-2" />
                              <strong>{commentObj.userName}</strong>
                            </div>
                            <p className="p-2 text-xs"> {formatDate(commentObj.createdAt)}</p>
                            <p className="p-2">{commentObj.comment}</p>
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
              )}

              {isDialogOpen && (
                <Dialog
                  open={isDialogOpen}
                >
                  <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
                  <DialogContent className="bg-  rounded-lg p-6 mx-auto mt-20 max-w-sm">
                    <DialogTitle>Update Task</DialogTitle>
                    <div className="mt-4">
                      <Label>Comment</Label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="border rounded-lg px-2 py-1 w-full mt-2"
                      />
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        onClick={() => setIsDialogOpen(false)}
                        className="bg-gray-500 text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateTaskStatus}
                        className="bg-blue-500 text-white"
                      >
                        Update Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
