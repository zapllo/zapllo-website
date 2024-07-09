import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardAnalytics from "@/components/globals/dashboardAnalytics";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCheck, FileWarning, User as UserIcon, User, Search } from "lucide-react";
import { IconClock } from "@tabler/icons-react";
import { PlayIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "../ui/dialog";

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
  categories: string[];
  priority: string;
  repeatType?: string;
  repeat: boolean;
  days?: string[];
  dueDate: string;
  attachment?: string;
  links?: string[];
  status: string;
}

interface TasksTabProps {
  tasks: Task[] | null;
  currentUser: User;
}

export default function TasksTab({ tasks, currentUser }: TasksTabProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState([]);
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
        task.categories.some(cat => cat.toLowerCase().includes(lowerCaseQuery)) ||
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
          userName: `${currentUser.firstName} ${currentUser.lastName}`,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update the task in the state
        const updatedTasks = tasks?.map(task =>
          task._id === selectedTask._id ? result.task : task
        );
        // Assuming you have a setTasks state to update the tasks
        setTasks(updatedTasks);
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
                  isOpen={isDialogOpen}
                  onDismiss={() => setIsDialogOpen(false)}
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
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>{selectedTask.title}</SheetTitle>
                      <SheetDescription>
                        Task details
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <h1 id="title" className="col-span-3">{selectedTask.title}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="user" className="text-right">
                          User
                        </Label>
                        <h1 id="user" className="col-span-3">{`${selectedTask.user.firstName} ${selectedTask.user.lastName}`}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <h1 id="description" className="col-span-3">{selectedTask.description}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assignedUser" className="text-right">
                          Assigned User
                        </Label>
                        <h1 id="assignedUser" className="col-span-3">{`${selectedTask.assignedUser.firstName} ${selectedTask.assignedUser.lastName}`}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categories" className="text-right">
                          Categories
                        </Label>
                        <h1 id="categories" className="col-span-3">{selectedTask.categories.join(', ')}</h1>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                          Priority
                        </Label>
                        <h1 id="priority" className="col-span-3">{selectedTask.priority}</h1>
                      </div>
                      {selectedTask.repeatType && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="repeatType" className="text-right">
                            Repeat Type
                          </Label>
                          <h1 id="repeatType" className="col-span-3">{selectedTask.repeatType}</h1>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="repeat" className="text-right">
                          Repeat
                        </Label>
                        <h1 id="repeat" className="col-span-3">{selectedTask.repeat ? 'Yes' : 'No'}</h1>
                      </div>
                      {selectedTask.days && selectedTask.days.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="days" className="text-right">
                            Days
                          </Label>
                          <h1 id="days" className="col-span-3">{selectedTask.days.join(', ')}</h1>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <h1 id="dueDate" className="col-span-3">{new Date(selectedTask.dueDate).toLocaleDateString()}</h1>
                      </div>
                      {selectedTask.attachment && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="attachment" className="text-right">
                            Attachment
                          </Label>
                          <h1 id="attachment" className="col-span-3">{selectedTask.attachment}</h1>
                        </div>
                      )}
                      {selectedTask.links && selectedTask.links.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="links" className="text-right">
                            Links
                          </Label>
                          <h1 id="links" className="col-span-3">{selectedTask.links.join(', ')}</h1>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <h1 id="status" className="col-span-3">{selectedTask.status}</h1>
                      </div>
                    </div>
                    <Label className="mt-2">Comments</Label>
                    <div className="space-y-2">
                      {selectedTask.comments.map((commentObj, index) => (
                        <div key={index} className="border rounded-lg p-2">
                          <strong>{commentObj.userName}</strong>
                          <p>{commentObj.comment}</p>
                        </div>
                      ))}
                    </div>
                    <SheetFooter>
                      <div className="gap-2  ">
                        <div className=" rounded px-4 flex gap-2 py-1">
                          <Button
                            onClick={() => {
                              setStatusToUpdate("In Progress");
                              setIsDialogOpen(true);
                            }}
                            className=" gap-2 w-full"
                          >
                            <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                            In Progress
                          </Button>

                        </div>
                        <div className=" rounded px-4 flex gap-2 py-1">
                          <Button
                            onClick={() => {
                              setStatusToUpdate("Completed");
                              setIsDialogOpen(true);
                            }}
                            className="bg--500 w-full"
                          >
                            <CheckCheck className="h-4  rounded-full text-green-400" />

                            Completed
                          </Button>
                        </div>
                      </div>

                      {/* <Button onClick={() => setSelectedTask(null)}>Close</Button> */}
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
