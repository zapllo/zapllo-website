import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardAnalytics from "@/components/globals/dashboardAnalytics";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCheck, FileWarning, User as UserIcon, User, Search, Bell, User2, Clock, Repeat, Circle, CheckCircle, Loader, Calendar, Flag, FlagIcon, Edit, Delete, Trash, PersonStanding, TagIcon, FilterIcon, CircleAlert, Check } from "lucide-react";
import { IconBrandTeams, IconClock, IconProgress } from "@tabler/icons-react";
import { PersonIcon, PlayIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import axios from "axios";
import EditTaskDialog from "./editTask";
import { useRouter } from "next/navigation";
import FilterModal from "./filterModal";
import Home from "../icons/home";
import HomeIcon from "../icons/homeIcon";
import TasksIcon from "../icons/tasksIcon";
import { Tabs2, TabsList2, TabsTrigger2 } from "../ui/tabs2";
import { Tabs3, TabsList3, TabsTrigger3 } from "../ui/tabs3";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Define the User interface
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  organization: string;
  role: string;
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
  repeatType: string;
  repeat: boolean;
  days?: string[];
  dates?: string[];
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

interface Category {
  _id: string;
  name: string; // Assuming a user ID for the commenter
  organization: string; // Name of the commenter
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
  const [activeDashboardTab, setActiveDashboardTab] = useState<string>("employee-wise");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState<string>("");
  // State variables for filters
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [repeatFilter, setRepeatFilter] = useState<boolean | null>(null);
  const [assignedUserFilter, setAssignedUserFilter] = useState<string | null>(null);
  const [dueDateFilter, setDueDateFilter] = useState<string | null>(null);
  // State variables for modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [assignedByFilter, setAssignedByFilter] = useState<string[]>([]);
  const [frequencyFilter, setFrequencyFilter] = useState<string[]>([]);
  const [priorityFilterModal, setPriorityFilterModal] = useState<string[]>([]);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTaskCategory, setSelectedTaskCategory] = useState<Category | null>(null);


  const applyFilters = (filters: any) => {
    setCategoryFilter(filters.categories);
    setAssignedByFilter(filters.users);
    setFrequencyFilter(filters.frequency);
    setPriorityFilterModal(filters.priority);
  };

  useEffect(() => {
    const fetchCategoryOfSelectedTask = async (selectedTaskCategoryId: any) => {
      try {
        const response = await fetch('/api/category/getById', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ categoryId: selectedTaskCategoryId }),
        });
        const result = await response.json();

        if (response.ok) {
          setSelectedTaskCategory(result.data);
        } else {
          console.error(result.error);
        }
      } catch (error: any) {
        console.error('Failed to fetch category:', error.message);
      }
    };

    if (selectedTask && selectedTask.category) {
      fetchCategoryOfSelectedTask(selectedTask.category);
    }
  }, [selectedTask]);

  const filteredTasks = tasks?.filter(task => {
    let isFiltered = true;

    // Filter based on active tab
    if (activeTab === "myTasks") {
      isFiltered = task.assignedUser._id === currentUser._id || task.user._id === currentUser._id;
    } else if (activeTab === "delegatedTasks") {
      isFiltered = (task.user._id === currentUser._id && task.assignedUser._id !== currentUser._id) || task.assignedUser._id === currentUser._id;
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

    // Apply filters from modal
    if (isFiltered && categoryFilter.length > 0) {
      isFiltered = categoryFilter.includes(task.category);
    }

    if (isFiltered && assignedByFilter.length > 0) {
      isFiltered = assignedByFilter.includes(task.user._id);
    }

    if (isFiltered && frequencyFilter.length > 0) {
      isFiltered = frequencyFilter.includes(task.repeatType);
    }

    if (isFiltered && priorityFilterModal.length > 0) {
      isFiltered = priorityFilterModal.includes(task.priority);
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

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userRes = await axios.get('/api/users/me');
        const userData = userRes.data.data;
        setUserDetails(userData);
      } catch (error) {
        console.error('Error fetching user details ', error);
      }
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
        } else {
          console.error('Error fetching users:', result.error);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);


  const [categories, setCategories] = useState<Category[]>([]);


  // Fetch categories from the server
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (response.ok) {
        setCategories(result.data);
      } else {
        console.log(result.error);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  console.log(categories, 'categories?')

  useEffect(() => {

    fetchCategories();

  }, []);

  // Function to filter tasks based on selected filters and search query
  // const filteredTasks = tasks?.filter(task => {
  //   let isFiltered = true;

  //   // Filter based on active tab
  //   if (activeTab === "myTasks") {
  //     isFiltered = task.assignedUser._id === currentUser._id || task.user._id === currentUser._id;
  //   } else if (activeTab === "delegatedTasks") {
  //     isFiltered = task.user._id === currentUser._id && task.assignedUser._id !== currentUser._id;
  //   } else if (activeTab === "allTasks") {
  //     isFiltered = task.user.organization === currentUser.organization;
  //   }

  //   // Apply other filters
  //   if (isFiltered && priorityFilter) {
  //     isFiltered = task.priority === priorityFilter;
  //   }

  //   if (isFiltered && repeatFilter !== null) {
  //     isFiltered = task.repeat === repeatFilter;
  //   }

  //   if (isFiltered && assignedUserFilter) {
  //     isFiltered = task.assignedUser._id === assignedUserFilter;
  //   }

  //   if (isFiltered && dueDateFilter) {
  //     isFiltered = task.dueDate === dueDateFilter;
  //   }

  //   // Apply search query filter globally
  //   if (searchQuery) {
  //     const lowerCaseQuery = searchQuery.toLowerCase();
  //     isFiltered = (
  //       task.title.toLowerCase().includes(lowerCaseQuery) ||
  //       task.description.toLowerCase().includes(lowerCaseQuery) ||
  //       task.user.firstName.toLowerCase().includes(lowerCaseQuery) ||
  //       task.user.lastName.toLowerCase().includes(lowerCaseQuery) ||
  //       task.assignedUser.firstName.toLowerCase().includes(lowerCaseQuery) ||
  //       task.assignedUser.lastName.toLowerCase().includes(lowerCaseQuery) ||
  //       task.status.toLowerCase().includes(lowerCaseQuery)
  //     );
  //   }

  //   return isFiltered;
  // });


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

  // console.log(tasks, 'tasks');


  const handleEditClick = () => {
    setTaskToEdit(selectedTask);
    setIsEditDialogOpen(true);
  };

  const handleTaskUpdate = (updatedTask: any) => {
    setSelectedTask(updatedTask);
    onTaskUpdate(updatedTask);
  };


  // console.log(selectedTask?.category, 'category! ');
  // console.log(selectedTaskCategory, 'is it?');

  const getUserTaskStats = (userId: any) => {
    const userTasks = tasks.filter(task => task.assignedUser._id === userId);
    const overdueTasks = userTasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== 'Completed').length;
    const completedTasks = userTasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = userTasks.filter(task => task.status === 'In Progress').length;
    const pendingTasks = userTasks.filter(task => task.status === 'Pending').length;

    return { overdueTasks, completedTasks, inProgressTasks, pendingTasks };
  };

  const getCategoryTaskStats = (categoryId: any) => {
    const categoryTasks = tasks.filter(task => task.category === categoryId);
    const overdueTasks = categoryTasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== 'Completed').length;
    const completedTasks = categoryTasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = categoryTasks.filter(task => task.status === 'In Progress').length;
    const pendingTasks = categoryTasks.filter(task => task.status === 'Pending').length;

    return { overdueTasks, completedTasks, inProgressTasks, pendingTasks };
  };

  const getTotalTaskStats = () => {
    const overdueTasks = tasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== 'Completed').length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;

    return { overdueTasks, completedTasks, inProgressTasks, pendingTasks };
  };

  {/**Task Summary */ }
  const TaskSummary = () => {
    const { overdueTasks, completedTasks, inProgressTasks, pendingTasks } = getTotalTaskStats();

    return (
      <div className="p-4 flex  gap-4 mb-2 rounded-lg shadow-md">
        {/* <h2 className="text-lg font-medium mb-4">Task Summary</h2> */}

        <div className="border px-4 py-3  flex gap-4 rounded-xl">
          <CircleAlert className="text-red-500 h-10 scale-125" />
          <div>
            <p className="text-sm">Overdue </p>
            <h1 className="font-bold text-xl">{overdueTasks}</h1>
          </div>
        </div>
        <div className="border px-4 py-3  flex gap-4 rounded-xl">
          <Circle className="text-red-400 h-10 scale-125" />
          <div>
            <p className="text-sm">Pending </p>
            <h1 className="font-bold  text-xl">{pendingTasks}</h1>
          </div>
        </div>
        <div className="border px-4 py-3  flex gap-4 rounded-xl">
          <IconProgress className="text-orange-500 h-10 scale-125" />
          <div>
            <p className="text-sm">In Progress </p>
            <h1 className="font-bold  text-xl">{inProgressTasks}</h1>
          </div>
        </div>
        <div className="border px-4 py-3  flex gap-4 rounded-xl">
          <CheckCircle className="text-green-500 h-10 scale-125" />
          <div>
            <p className="text-sm">Completed </p>
            <h1 className="font-bold  text-xl">{completedTasks}</h1>
          </div>
        </div>
        <div className="border px-4 py-3  flex gap-4 rounded-xl">
          <Clock className="text-green-500 h-10 scale-125" />
          <div>
            <p className="text-sm">In Time </p>
            <h1 className="font-bold  text-xl">{completedTasks}</h1>
          </div>
        </div>
        <div className="border px-4 py-3  flex gap-4 rounded-xl">
          <CheckCircle className="text-red-500 h-10 scale-125" />
          <div>
            <p className="text-sm">Delayed </p>
            <h1 className="font-bold  text-xl">{completedTasks}</h1>
          </div>
        </div>
      </div>
    );
  };


  const getCategoryReportTaskStats = (categoryId: any) => {
    const categoryTasks = filteredTasks?.filter(task => task.category === categoryId);
    return {
      overdueTasks: categoryTasks?.filter(task => task.status === 'Overdue').length,
      completedTasks: categoryTasks?.filter(task => task.status === 'Completed').length,
      inProgressTasks: categoryTasks?.filter(task => task.status === 'In Progress').length,
      pendingTasks: categoryTasks?.filter(task => task.status === 'Pending').length
    };
  };

  const renderTabs = () => {
    if (userDetails?.role === 'member') {
      return (
        <>
          <TabsTrigger value="all" className="gap-2">
            <HomeIcon />Dashboard
          </TabsTrigger>
          <TabsTrigger value="myTasks" className="gap-2"><TasksIcon /> Tasks</TabsTrigger>
          <TabsTrigger value="delegatedTasks" className="gap-2">Delegated Tasks</TabsTrigger>
        </>
      );
    } else {
      return (
        <>
          <TabsTrigger value="all" className=" flex justify-start w- gap-2">
            <div className="flex justify-start ml-4 w-full gap-2">
              <HomeIcon />
              <h1 className="mt-auto">
                Dashboard
              </h1>
            </div>
          </TabsTrigger>
          <TabsTrigger value="myTasks" className=" flex justify-start w-">
            <div className="flex justify-start ml-4 w-full gap-2">
              <TasksIcon />
              <h1 className="mt-auto">
                My Tasks
              </h1>
            </div>
          </TabsTrigger>
          <TabsTrigger value="delegatedTasks" className=" flex justify-start w-">
            <div className="flex justify-start w-full ml-4 gap-2">
              <img src='/icons/delegated.png' className='h-4' />

              <h1>
                Delegated Tasks

              </h1>
            </div>
          </TabsTrigger>
          <TabsTrigger value="allTasks" className=" flex justify-start w-">
            <div className="flex justify-start w-full gap-2 ml-4">
              <img src='/icons/all.png' className='h-4' />

              <h1>
                All Tasks

              </h1>
            </div>
          </TabsTrigger>
        </>
      );
    }
  };



  return (
    <div className="w-full    max-w-8xl mx-auto">

      <div className="flex">
        {/* <div className="flex px-4 mt-1 space-x-2 items-center mb-2">
        <Search />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border rounded-md w-1/4"
        />
      </div> */}

        <div className="flex flex-col justify-start border-r mb-6 ">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex gap-y-6 text-center">
              {/* <TabsTrigger value="all">Dashboard</TabsTrigger>
            <TabsTrigger value="myTasks">My Tasks</TabsTrigger>
            <TabsTrigger value="delegatedTasks">Delegated Tasks</TabsTrigger>
            <TabsTrigger value="allTasks">All Tasks</TabsTrigger> */}
              {renderTabs()}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex ml-12 w-full">
          <Tabs3 defaultValue={activeDashboardTab} onValueChange={setActiveDashboardTab} className="-mt-1 ">
            <TabsList3 className="flex gap-4">
              <TabsTrigger3 className="flex gap-2" value="employee-wise">Today</TabsTrigger3>
              <TabsTrigger3 value="category-wise" className="flex gap-2">Yesterday</TabsTrigger3>
              <TabsTrigger3 value="my-report">This Week </TabsTrigger3>
              <TabsTrigger3 value="my-report">Last Week </TabsTrigger3>
              <TabsTrigger3 value="delegatedTasks">This Month</TabsTrigger3>
              <TabsTrigger3 value="delegatedTasks">Last Month</TabsTrigger3>
              <TabsTrigger3 value="delegatedTasks">This Year</TabsTrigger3>
              <TabsTrigger3 value="delegatedTasks">All Time</TabsTrigger3>
              <TabsTrigger3 value="delegatedTasks">Custom</TabsTrigger3>
            </TabsList3>
          </Tabs3>

        </div>
        {/*  */}
        <div className="-ml-[100%]">
          {activeTab === "all" ? (
            <div className="flex mt-12  flex-col ">
              <TaskSummary />

              {/* <DashboardAnalytics /> */}
              <Tabs2 defaultValue={activeDashboardTab} onValueChange={setActiveDashboardTab} className="full ">
                <TabsList2 className="flex gap-4">
                  <TabsTrigger2 className="flex gap-2" value="employee-wise"><PersonIcon className="h-4" />Employee Wise</TabsTrigger2>
                  <TabsTrigger2 value="category-wise" className="flex gap-2"><TagIcon className="h-4" /> Category Wise</TabsTrigger2>
                  <TabsTrigger2 value="my-report">My Report </TabsTrigger2>
                  <TabsTrigger2 value="delegatedTasks">Delegated</TabsTrigger2>
                </TabsList2>
              </Tabs2>

              {activeDashboardTab === "employee-wise" && (
                <div>
                  <div className="flex px-4 mt-4 space-x-2 justify- mb-2">
                    <input
                      type="text"
                      placeholder="Search Employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-1 border ml-auto bg-transparent rounded-md w-"
                    />
                  </div>
                  <div className="grid gap-4">
                    {users.filter(user => {
                      const query = searchQuery.toLowerCase();
                      return (
                        user.firstName.toLowerCase().includes(query) ||
                        user.lastName.toLowerCase().includes(query)
                      );
                    }).map(user => {
                      const { overdueTasks, completedTasks, inProgressTasks, pendingTasks } = getUserTaskStats(user._id);
                      const totalTasks = overdueTasks + completedTasks + inProgressTasks + pendingTasks;
                      const getCompletionPercentage = (completedTasks: any, totalTasks: any) => {
                        return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
                      };
                      const completionPercentage = getCompletionPercentage(completedTasks, totalTasks);



                      return (
                        <Card key={user._id} className="p-4 flex bg-[#] flex-col gap-2">
                          <div className="flex gap-2 justify-start">
                            <div className="h-10 w-10 rounded-full bg-primary -400">
                              <h1 className="text-center text-2xl mt-1 uppercase">
                                {`${user?.firstName?.slice(0, 1)}`}
                              </h1>
                            </div>

                            <h2 className="text-lg mt-1 font-medium">{user.firstName} </h2>
                          </div>
                          <div className="ml-auto  -mt-4" style={{ width: 50, height: 50 }}>
                            <div className="">
                              <CircularProgressbar
                                value={completionPercentage}
                                text={`${Math.round(completionPercentage)}%`}
                                styles={buildStyles({
                                  textSize: '24px',
                                  pathColor: `#d6d6d6`, // Fixed path color
                                  textColor: '#ffffff',
                                  trailColor: '#6C636E', // Trail color should be lighter for better contrast
                                  backgroundColor: '#3e98c7',
                                })}
                              />
                            </div>

                          </div>
                          {/* <p className="text-xs"> {user.email}</p> */}
                          <div className="flex gap-4 absolute mt-16">
                            <div className="flex gap-1 font-bold">
                              <CircleAlert className="text-red-500 h-5" />
                              <p className="text-sm">Overdue: {overdueTasks}</p>
                            </div>
                            <h1 className="text-[#6C636E]">|</h1>

                            <div className="flex gap-1 font-bold">
                              <Circle className="text-red-400 h-5" />
                              <p className="text-sm">Pending: {pendingTasks}</p>
                            </div>
                            <h1 className="text-[#6C636E]">|</h1>

                            <div className="flex gap-1 font-bold">
                              <IconProgress className="text-orange-600 h-5" />
                              <p className="text-sm">In Progress: {inProgressTasks}</p>
                            </div>
                            <h1 className="text-[#6C636E]">|</h1>

                            <div className="flex gap-1 font-bold">
                              <CheckCircle className="text-green-600 h-5" />
                              <p className="text-sm">Completed: {completedTasks}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
              {activeDashboardTab === "my-report" && userDetails && (
                <div>
                  <div className="flex px-4 mt-4 space-x-2 justify-center mb-2">
                    <input
                      type="text"
                      placeholder="Search Categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 border rounded-md w- ml-auto"
                    />
                    {/* <Button onClick={() => setIsModalOpen(true)} className="bg-green-700">Filter</Button> */}
                  </div>
                  <div className="grid gap-4">
                    {categories.filter(category => {
                      const query = searchQuery.toLowerCase();
                      return (
                        category.name.toLowerCase().includes(query)
                      );
                    }).map(category => {
                      const { overdueTasks, completedTasks, inProgressTasks, pendingTasks } = getCategoryReportTaskStats(category._id);

                      return (
                        <Card key={category._id} className="p-4 flex  flex-col gap-2">
                          <h2 className="text-lg font-medium">{category.name}</h2>
                          <div className="flex gap-4 mt-2">
                            <div className="flex gap-1 font-bold">
                              <p className="text-sm">Overdue: {overdueTasks}</p>
                            </div>
                            <div className="flex gap-1 font-bold">
                              <p className="text-sm">Pending: {pendingTasks}</p>
                            </div>
                            <div className="flex gap-1 font-bold">
                              <p className="text-sm">In Progress: {inProgressTasks}</p>
                            </div>
                            <div className="flex gap-1 font-bold">
                              <p className="text-sm">Completed: {completedTasks}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
              {activeDashboardTab === "category-wise" && (
                <div>
                  <div className="flex px-4 mt-4 space-x-2 justify-center mb-2">
                    <input
                      type="text"
                      placeholder="Search Categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 border rounded-md ml-auto"
                    />
                  </div>
                  <div className="grid gap-4">
                    {categories.filter(category => {
                      const query = searchQuery.toLowerCase();
                      return category.name.toLowerCase().includes(query);
                    }).map(category => {
                      const { overdueTasks, completedTasks, inProgressTasks, pendingTasks } = getCategoryTaskStats(category._id);

                      return (
                        <Card key={category._id} className="p-4 flex flex-col gap-2">
                          <h2 className="text-lg font-medium">{category.name}</h2>
                          <div className="flex gap-4 mt-2">
                            <div className="flex gap-1 font-bold">
                              <CircleAlert className="text-red-500 h-5" />
                              <p className="text-sm">Overdue: {overdueTasks}</p>
                            </div>
                            <div className="flex gap-1 font-bold">
                              <Circle className="text-red-400 h-5" />
                              <p className="text-sm">Pending: {pendingTasks}</p>
                            </div>
                            <div className="flex gap-1 font-bold">
                              <IconProgress className="text-orange-600 h-5" />
                              <p className="text-sm">In Progress: {inProgressTasks}</p>
                            </div>
                            <div className="flex gap-1 font-bold">
                              <CheckCircle className="text-green-600 h-5" />
                              <p className="text-sm">Completed: {completedTasks}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid mt-12 w-full text-sm gap-4">
              <div className="flex px-4 mt-2 w-full  space-x-2 justify- ">
                <input
                  type="text"
                  placeholder="Search Tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 border rounded-md w-1/"
                />
                <Button onClick={() => setIsModalOpen(true)} className="bg-green-700"><FilterIcon className="h-4" /> Filter</Button>
              </div>
              {filteredTasks?.map((task) => (
                <div key={task._id} className="w-full">

                  <Card
                    className="flex w-full  items-center rounded-md bg-[#352339] justify-between cursor-pointer p-4"
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
                                <div className="h-6 w-6 rounded-full bg-primary-400">
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
                            <div className="ml-2">
                              {selectedTask?.dates?.length && selectedTask.dates.length > 0 ? (
                                <h1 className="font-bold">
                                  ({selectedTask?.dates?.join(', ')})
                                </h1>
                              ) : (
                                <p>No specific dates selected.</p>
                              )}
                            </div>
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
                              {selectedTaskCategory?.name}
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
                            onClick={handleEditClick}
                            className="bg-gray-600 w-full"
                          >
                            <Edit className="h-4 rounded-full text-blue-400" />
                            Edit
                          </Button>
                          <EditTaskDialog
                            open={isEditDialogOpen}
                            onClose={() => setIsEditDialogOpen(false)}
                            task={selectedTask}
                            users={users}
                            categories={categories}
                            onTaskUpdate={handleTaskUpdate}
                          />
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
              <FilterModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                categories={categories}
                users={users}
                applyFilters={applyFilters}
              />
            </div>
          )}
        </div>
      </div>



    </div>
  );
}
