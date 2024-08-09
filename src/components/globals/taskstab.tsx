import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardAnalytics from "@/components/globals/dashboardAnalytics";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCheck, FileWarning, User as UserIcon, User, Search, Bell, User2, Clock, Repeat, Circle, CheckCircle, Loader, Calendar, Flag, FlagIcon, Edit, Delete, Trash, PersonStanding, TagIcon, FilterIcon, CircleAlert, Check, FileIcon, FileCodeIcon, FileTextIcon, Grid2X2, Tag, Repeat1Icon, RepeatIcon, ArrowLeft, Plus, Link, Copy, CopyIcon, GlobeIcon, File, Mic } from "lucide-react";
import { IconBrandTeams, IconClock, IconCopy, IconProgress, IconProgressBolt, IconProgressCheck } from "@tabler/icons-react";
import { PersonIcon, PlayIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogTitle } from "../ui/dialog";
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
import { toast, Toaster } from "sonner";
import WaveSurfer from 'wavesurfer.js';
import { TaskSummary } from "./taskSummary";
import { MyTasksSummary } from "./myTasksSummary";
import { DelegatedTasksSummary } from "./delegatedTasksSummary";

// Define the User interface
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  role: string;
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

type TaskUpdateCallback = (updatedTask: Task) => void;

interface TasksTabProps {
  tasks: Task[] | null;
  currentUser: User;
  onTaskUpdate: TaskUpdateCallback;
  onTaskDelete: (taskId: string) => void;
}

interface TaskStatusCounts {
  [key: string]: number;
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
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
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
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState('');
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioURLRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
    }
  }, [audioBlob]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext; // Type assertion
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const blob = new Blob([event.data], { type: 'audio/wav' });
          setAudioBlob(blob);
          const audioURL = URL.createObjectURL(blob);
          audioURLRef.current = audioURL;
        }
      };

      mediaRecorder.onstop = () => {
        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);

      // Real-time waveform visualization
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasCtx = canvas.getContext('2d');
        if (canvasCtx) {
          const drawWaveform = () => {
            if (analyserRef.current) {
              requestAnimationFrame(drawWaveform);
              analyserRef.current.getByteTimeDomainData(dataArray);
              canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
              canvasCtx.lineWidth = 2;
              canvasCtx.strokeStyle = 'green';
              canvasCtx.beginPath();

              const sliceWidth = canvas.width * 1.0 / bufferLength;
              let x = 0;

              for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0; // Convert to 0.0 to 1.0
                const y = v * canvas.height / 2; // Convert to canvas height

                if (i === 0) {
                  canvasCtx.moveTo(x, y);
                } else {
                  canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
              }

              canvasCtx.lineTo(canvas.width, canvas.height / 2);
              canvasCtx.stroke();
            }
          };

          drawWaveform();
        }
      }

      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };






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
      isFiltered = task.assignedUser?._id === currentUser?._id;
    } else if (activeTab === "delegatedTasks") {
      isFiltered = (task.user._id === currentUser?._id && task.assignedUser._id !== currentUser?._id) || task.assignedUser._id === currentUser?._id;
    } else if (activeTab === "allTasks") {
      isFiltered = task.user.organization === currentUser?.organization;
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
      isFiltered = categoryFilter.includes(task.category.name);
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

  const filterTasks = (tasks: Task[], activeTab: string): Task[] => {
    return tasks?.filter(task => {
      let isFiltered = true;

      // Filter based on active tab
      if (activeTab === "myTasks") {
        isFiltered = task?.assignedUser?._id === currentUser?._id;
      } else if (activeTab === "delegatedTasks") {
        isFiltered = (task.user?._id === currentUser?._id && task.assignedUser?._id !== currentUser?._id) || task.assignedUser?._id === currentUser?._id;
      } else if (activeTab === "allTasks") {
        isFiltered = task.user?.organization === currentUser?.organization;
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
        isFiltered = categoryFilter.includes(task.category.name);
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
  };

  const countStatuses = (tasks: Task[]): TaskStatusCounts => {
    return tasks.reduce<TaskStatusCounts>((counts, task) => {
      const dueDate = new Date(task.dueDate);
      const completionDate = task.completionDate ? new Date(task.completionDate) : null;
      const now = new Date();

      // Count overdue tasks
      if (dueDate < now && task.status !== "Completed") {
        counts["Overdue"] = (counts["Overdue"] || 0) + 1;
      }

      // Count completed tasks as either "In Time" or "Delayed"
      if (task.status === "Completed" && completionDate) {
        if (completionDate <= dueDate) {
          counts["In Time"] = (counts["In Time"] || 0) + 1;
        } else {
          counts["Delayed"] = (counts["Delayed"] || 0) + 1;
        }
      }

      // Count task status
      counts[task.status] = (counts[task.status] || 0) + 1;

      return counts;
    }, {} as TaskStatusCounts);
  };




  // Filter tasks for each tab
  const myTasks = filterTasks(tasks || [], "myTasks");
  const delegatedTasks = filterTasks(tasks || [], "delegatedTasks");
  const allTasks = filterTasks(tasks || [], "allTasks");


  // Count statuses for each filtered set
  const myTasksCounts = countStatuses(myTasks);
  const delegatedTasksCounts = countStatuses(delegatedTasks);
  const allTasksCounts = countStatuses(allTasks);

  const myTasksPendingCount = myTasksCounts["Pending"] || 0;
  const myTasksInProgressCount = myTasksCounts["In Progress"] || 0;
  const myTasksCompletedCount = myTasksCounts["Completed"] || 0;
  const myTasksOverdueCount = myTasksCounts["Overdue"] || 0;
  const myTasksInTimeCount = myTasksCounts["In Time"] || 0;
  const myTasksDelayedCount = myTasksCounts["Delayed"] || 0;

  const delegatedTasksPendingCount = delegatedTasksCounts["Pending"] || 0;
  const delegatedTasksInProgressCount = delegatedTasksCounts["In Progress"] || 0;
  const delegatedTasksCompletedCount = delegatedTasksCounts["Completed"] || 0;
  const delegatedTasksOverdueCount = delegatedTasksCounts["Overdue"] || 0;
  const delegatedTasksInTimeCount = delegatedTasksCounts["In Time"] || 0;
  const delegatedTasksDelayedCount = delegatedTasksCounts["Delayed"] || 0;

  const allTasksPendingCount = allTasksCounts["Pending"] || 0;
  const allTasksInProgressCount = allTasksCounts["In Progress"] || 0;
  const allTasksCompletedCount = allTasksCounts["Completed"] || 0;
  const allTasksOverdueCount = allTasksCounts["Overdue"] || 0;
  const allTasksInTimeCount = allTasksCounts["In Time"] || 0;
  const allTasksDelayedCount = allTasksCounts["Delayed"] || 0;

  console.log("My Tasks - Pending:", myTasksPendingCount, "In Progress:", myTasksInProgressCount, "Completed:", myTasksCompletedCount, "Overdue:", myTasksOverdueCount, "In Time:", myTasksInTimeCount, "Delayed:", myTasksDelayedCount);
  console.log("Delegated Tasks - Pending:", delegatedTasksPendingCount, "In Progress:", delegatedTasksInProgressCount, "Completed:", delegatedTasksCompletedCount, "Overdue:", delegatedTasksOverdueCount, "In Time:", delegatedTasksInTimeCount, "Delayed:", delegatedTasksDelayedCount);
  console.log("All Tasks - Pending:", allTasksPendingCount, "In Progress:", allTasksInProgressCount, "Completed:", allTasksCompletedCount, "Overdue:", allTasksOverdueCount, "In Time:", allTasksInTimeCount, "Delayed:", allTasksDelayedCount);

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
        setComment("");
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


  const handleEditClick = () => {
    setTaskToEdit(selectedTask);
    setIsEditDialogOpen(true);
  };

  const handleTaskUpdate = (updatedTask: any) => {
    setSelectedTask(updatedTask);
    onTaskUpdate(updatedTask);
  };


  const getUserTaskStats = (userId: any) => {
    const userTasks = tasks.filter(task => task.assignedUser?._id === userId);
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
    const delayedTasks = tasks.filter(task => task.status === 'Completed' && new Date(task.completionDate) > new Date(task.dueDate)).length;
    const inTimeTasks = tasks.filter(task => task.status === 'Completed' && new Date(task.completionDate) <= new Date(task.dueDate)).length;

    return { overdueTasks, completedTasks, inProgressTasks, pendingTasks, delayedTasks, inTimeTasks };
  };

  {/**Task Summary */ }

  const { overdueTasks, completedTasks, inProgressTasks, pendingTasks, delayedTasks, inTimeTasks } = getTotalTaskStats();


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

  const formatTaskDate = (dateString: string): string => {
    const date = new Date(dateString);
    const optionsDate: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'long', day: 'numeric' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };

    return `${date.toLocaleDateString(undefined, optionsDate)} - ${date.toLocaleTimeString(undefined, optionsTime)}`;
  };




  const handleCopy = (link: string) => {
    setCopied(true);
    toast.success('Link copied!'); // Optional: Show a notification
  };


  const sortedComments = selectedTask?.comments?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const img = document.createElement("img");
          img.src = result;
          img.style.maxWidth = "100%";
          if (editorRef.current) {
            editorRef.current.appendChild(img);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };



  return (
    <div className="w-full    max-w-8xl mx-auto">
      <Toaster />
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

        <div className="flex flex-col justify-start border-r  -mt-6 mb-6 ">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex gap-y-6 mt-12 text-center">
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
        <div className="-ml-[100%] ">
          {activeTab === "all" ? (
            <div className="flex mt-12  flex-col ">
              <div className="grid  w-full text-xs gap-4">
                <TaskSummary completedTasks={completedTasks} inProgressTasks={inProgressTasks} overdueTasks={overdueTasks} pendingTasks={pendingTasks} delayedTasks={delayedTasks} inTimeTasks={inTimeTasks} />
              </div>
              {/* <DashboardAnalytics /> */}
              <div className="flex gap-4 justify-center">
                <Tabs2 defaultValue={activeDashboardTab} onValueChange={setActiveDashboardTab} className="gap-4">
                  <TabsList2 className="flex gap-4">
                    <TabsTrigger2 className="flex gap-2 tabs-trigger" value="employee-wise"><PersonIcon className="h-4" />Employee Wise</TabsTrigger2>
                    <TabsTrigger2 value="category-wise" className="flex gap-2"><TagIcon className="h-4" /> Category Wise</TabsTrigger2>
                    <TabsTrigger2 value="my-report">My Report </TabsTrigger2>
                    <TabsTrigger2 value="delegatedTasks" className="tabs-trigger">Delegated</TabsTrigger2>
                  </TabsList2>
                </Tabs2>
              </div>
              {activeDashboardTab === "employee-wise" && (
                <div className="">
                  <div className="flex p-2 justify-center">
                    <div className="relative flex px-4 mt-4 space-x-2  mb-2">
                      <input
                        type="text"
                        placeholder="Search Employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-1 border outline-none text-[#8A8A8A] ml-auto bg-transparent rounded-md w-"
                      />

                    </div>
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

                          {/* <p className="text-xs"> {user.email}</p> */}
                          <div className="flex gap-4 ] mt-5">
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
                          <div className="ml-auto  -mt-12" style={{ width: 40, height: 40 }}>
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
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
              {activeDashboardTab === "my-report" && userDetails && (
                <div>
                  <div className="flex p-2 justify-center">
                    <div className="relative flex px-4 mt-4 space-x-2  mb-2">
                      <input
                        type="text"
                        placeholder="Search Employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-1 border outline-none text-[#8A8A8A] ml-auto bg-transparent rounded-md w-"
                      />

                    </div>
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
          ) : activeTab === "myTasks" ? (
            <div>
              <div className="grid mt-12 w-full text-sm gap-4">
                <div className="grid  w-full text-xs  gap-4">
                  <MyTasksSummary myTasksCompletedCount={myTasksCompletedCount} myTasksInProgressCount={myTasksInProgressCount} myTasksOverdueCount={myTasksOverdueCount} myTasksPendingCount={myTasksPendingCount} myTasksDelayedCount={myTasksDelayedCount} myTasksInTimeCount={myTasksInTimeCount} />
                </div>

                <div className="flex px-4 -mt-6 w-[100%]  space-x-2 justify-center ">
                  <div className="space-x-2 flex">
                    <div className=" flex px-4 mt-4 space-x-2 justify-center mb-2">
                      <input
                        type="text"
                        placeholder="Search Tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border outline-none text-[#8A8A8A] ml-auto bg-transparent rounded-md w-"
                      />

                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-[#007A5A] mt-4"><FilterIcon className="h-4" /> Filter</Button>
                  </div>
                </div>
                {filteredTasks && filteredTasks.length > 0 ? (
                  filteredTasks?.map((task) => (
                    <div key={task._id} className="">
                      <Card
                        className="flex  w-[100%] border-[0.5px] rounded hover:border-[#74517A] shadow-sm items-center bg-[#] justify-between cursor-pointer px-4 py-1"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className=" items-center gap-4">
                          <div>
                            <p className="font-medium text-sm text-white">{task.title}</p>
                            <p className="text-[#E0E0E0] text-xs">Assigned by <span className="text-[#007A5A] font-bold">
                              {task?.user?.firstName}
                            </span></p>
                          </div>
                          <div className="flex gap-2">

                            <div className="flex -ml-1  text-xs mt-2">
                              <IconClock className="h-5" />
                              <h1 className="mt-[1.5px]">
                                {formatTaskDate(task.dueDate)}
                              </h1>
                            </div>
                            <h1 className="mt-auto  text-[#E0E0E066] ">|</h1>
                            <div className="flex text-xs mt-[10px]">
                              <UserIcon className="h-4" />
                              {task.assignedUser.firstName}
                            </div>
                            <h1 className="mt-auto text-[#E0E0E066] ">|</h1>

                            <div className="flex text-xs mt-[11px]">
                              <TagIcon className="h-4" />
                              {task.category.name}
                            </div>

                            {task.repeat ? (
                              <div className="flex items-center">
                                <h1 className="mt-auto text-[#E0E0E066] mx-2">|</h1>

                                {task.repeatType && (
                                  <h1 className="flex mt-[11px] text-xs">
                                    <Repeat className="h-4 " />  {task.repeatType}
                                  </h1>
                                )}
                              </div>
                            ) : null}

                            {/* <div className="flex mt-auto">
                        <TagIcon className="h-5" />
                      </div> */}
                            <h1 className="mt-auto text-[#E0E0E066] ">|</h1>

                            <div className="flex text-xs">
                              <div className="mt-[11px]">
                                <IconProgressBolt className="h-4  " />

                              </div>
                              <h1 className="mt-auto">
                                {task.status}
                              </h1>
                            </div>
                          </div>

                        </div>
                        <div className="">
                          <div className="flex ">
                            <div className="gap-2 w-1/2 mt-4 mb-4 flex">
                              <Button
                                onClick={() => {
                                  setStatusToUpdate("In Progress");
                                  setIsDialogOpen(true);
                                }}
                                className="gap-2 border mt-2 h-6 bg-transparent hover:bg-[#007A5A]  border-gray-600 w-full"
                              >
                                <PlayIcon className="h-3  bg-[#FDB077] rounded-full w-3" />
                                In Progress
                              </Button>
                              <Button
                                onClick={() => {
                                  setStatusToUpdate("Completed");
                                  setIsCompleteDialogOpen(true);
                                }}
                                className=" border mt-2 bg-transparent h-6 hover:bg-[#007A5A]  border-gray-600 w-full "
                              >
                                <CheckCheck className="h-4 rounded-full text-green-400" />
                                Completed
                              </Button>


                            </div>
                          </div>

                          <div className="flex justify-end mt-4">

                          </div>
                        </div>
                      </Card>

                      {selectedTask && selectedTask._id === task._id && (
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
                                {task.links?.map((link, index) => (
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
                                <Button
                                  onClick={() => {
                                    setStatusToUpdate("In Progress");
                                    setIsDialogOpen(true);
                                  }}
                                  className="gap-2 border bg-transparent  border-gray-600 w-full"
                                >
                                  <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                                  In Progress
                                </Button>
                                <Button
                                  onClick={() => {
                                    setStatusToUpdate("Completed");
                                    setIsCompleteDialogOpen(true);
                                  }}
                                  className=" border bg-transparent  border-gray-600 w-full "
                                >
                                  <CheckCheck className="h-4 rounded-full text-green-400" />
                                  Completed
                                </Button>
                                <Button
                                  onClick={handleEditClick}
                                  className=" border bg-transparent  border-gray-600 w-full"
                                >
                                  <Edit className="h-4 rounded-full  text-blue-400" />
                                  Edit
                                </Button>
                                <EditTaskDialog
                                  open={isEditDialogOpen}
                                  onClose={() => setIsEditDialogOpen(false)}
                                  task={selectedTask as Task}
                                  users={users}
                                  categories={categories}
                                  onTaskUpdate={handleTaskUpdate}
                                />
                                <Button
                                  onClick={() => handleDelete(selectedTask._id)}
                                  className=" border bg-transparent  border-gray-600 w-full"
                                >
                                  <Trash className="h-4 rounded-full text-red-400" />
                                  Delete
                                </Button>
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
                      )}

                      {isDialogOpen && (
                        <Dialog
                          open={isDialogOpen}
                        >
                          <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
                          <DialogContent className="bg-[#1A1D21]  rounded-lg p-6 mx-auto  max-w-xl ">
                            <DialogTitle>Task Update</DialogTitle>
                            <p>Please add a note before marking the task as in progress</p>
                            <div className="mt-4">
                              <Label>Comment</Label>
                              <div
                                ref={editorRef}
                                contentEditable
                                className="border-gray-600 border rounded-lg outline-none px-2 py-6 w-full mt-2"
                                onInput={(e) => {
                                  const target = e.target as HTMLDivElement; // Cast to HTMLDivElement
                                  setComment(target.innerHTML);
                                }}
                              ></div>
                              <div className="flex mt-2">
                                <input type="file" onChange={handleFileChange} className="mt-2" />
                                <h1 onClick={() => { setIsRecordingModalOpen(true) }} className="text-sm mt-3 ml-1 cursor-pointer"> Attach an Audio</h1>
                                {recording ? (
                                  <div onClick={stopRecording} className='h-8 w-8 rounded-full items-center text-center mt-2 border cursor-pointer hover:shadow-white shadow-sm bg-red-500'>
                                    <Mic className='h-5 text-center m-auto mt-1' />
                                  </div>
                                ) : (
                                  <div onClick={startRecording} className='h-8 w-8 rounded-full items-center text-center mt-2 border cursor-pointer hover:shadow-white shadow-sm bg-[#007A5A]'>
                                    <Mic className='h-5 text-center m-auto mt-1' />
                                  </div>
                                )}


                              </div>
                              <canvas ref={canvasRef} className={` ${recording ? `w-full h-1/2` : 'hidden'} `}></canvas>
                              {audioBlob && (
                                <div className="mt-4">
                                  <audio controls src={audioURL} />
                                </div>
                              )}

                              {/* <img src="/icons/image.png" alt="image icon" /> */}
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                              <Button
                                onClick={() => setIsDialogOpen(false)}
                                className="w- text-white bg-gray-500 "
                              >
                                Close
                              </Button>
                              <Button
                                onClick={handleUpdateTaskStatus}
                                className="w-full text-white bg-[#007A5A]"
                              >
                                Update Task
                              </Button>

                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ))
                ) : (
                  <Card
                    className="flex  w-[108%] border-[0.5px] border-[#007A5A]  items-center rounded-lg bg-[#] justify-between cursor-pointer p-6"

                  >
                    <h1 className="text-center font-bold text-xl">
                      No Tasks Found
                    </h1>
                    <img src="/logo.png" className="w-[52.5%] h-[100%] opacity-0" />

                  </Card>
                )}
                <FilterModal
                  isOpen={isModalOpen}
                  closeModal={() => setIsModalOpen(false)}
                  categories={categories}
                  users={users}
                  applyFilters={applyFilters}
                />
              </div>
            </div>
          ) : activeTab === "delegatedTasks" ? (
            <div>
              <div className="grid mt-12 w-full text-sm gap-4">
                <div className="grid  w-full text-xs  gap-4">
                  <DelegatedTasksSummary delegatedTasksCompletedCount={delegatedTasksCompletedCount} delegatedTasksInProgressCount={delegatedTasksInProgressCount} delegatedTasksOverdueCount={delegatedTasksOverdueCount} delegatedTasksPendingCount={delegatedTasksPendingCount} delegatedTasksDelayedCount={delegatedTasksDelayedCount} delegatedTasksInTimeCount={delegatedTasksInTimeCount} />
                </div>

                <div className="flex px-4 -mt-6 w-[100%]  space-x-2 justify-center ">
                  <div className="space-x-2 flex">
                    <div className=" flex px-4 mt-4 space-x-2 justify-center mb-2">
                      <input
                        type="text"
                        placeholder="Search Tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border outline-none text-[#8A8A8A] ml-auto bg-transparent rounded-md w-"
                      />

                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-[#007A5A] mt-4"><FilterIcon className="h-4" /> Filter</Button>
                  </div>
                </div>
                {filteredTasks!.length > 0 ? (
                  filteredTasks!.map((task) => (
                    <div key={task._id} className="">
                      <Card
                        className="flex  w-[100%] border-[0.5px] rounded hover:border-[#74517A] shadow-sm items-center bg-[#] justify-between cursor-pointer px-4 py-1"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className=" items-center gap-4">
                          <div>
                            <p className="font-medium text-sm text-white">{task.title}</p>
                            <p className="text-[#E0E0E0] text-xs">Assigned by <span className="text-[#007A5A] font-bold">
                              {task.user.firstName}
                            </span></p>
                          </div>
                          <div className="flex gap-2">

                            <div className="flex -ml-1  text-xs mt-2">
                              <IconClock className="h-5" />
                              <h1 className="mt-[1.5px]">
                                {formatTaskDate(task.dueDate)}
                              </h1>
                            </div>
                            <h1 className="mt-auto  text-[#E0E0E066] ">|</h1>
                            <div className="flex text-xs mt-[10px]">
                              <UserIcon className="h-4" />
                              {task.assignedUser.firstName}
                            </div>
                            <h1 className="mt-auto text-[#E0E0E066] ">|</h1>

                            <div className="flex text-xs mt-[11px]">
                              <TagIcon className="h-4" />
                              {task.category.name}
                            </div>

                            {task.repeat ? (
                              <div className="flex items-center">
                                <h1 className="mt-auto text-[#E0E0E066] mx-2">|</h1>

                                {task.repeatType && (
                                  <h1 className="flex mt-[11px] text-xs">
                                    <Repeat className="h-4 " />  {task.repeatType}
                                  </h1>
                                )}
                              </div>
                            ) : null}

                            {/* <div className="flex mt-auto">
                      <TagIcon className="h-5" />
                    </div> */}
                            <h1 className="mt-auto text-[#E0E0E066] ">|</h1>

                            <div className="flex text-xs">
                              <div className="mt-[11px]">
                                <IconProgressBolt className="h-4  " />

                              </div>
                              <h1 className="mt-auto">
                                {task.status}
                              </h1>
                            </div>
                          </div>

                        </div>
                        <div className="">
                          <div className="flex ">
                            <div className="gap-2 w-1/2 mt-4 mb-4 flex">
                              <Button
                                onClick={() => {
                                  setStatusToUpdate("In Progress");
                                  setIsDialogOpen(true);
                                }}
                                className="gap-2 border mt-2 h-6 bg-transparent hover:bg-[#007A5A]  border-gray-600 w-full"
                              >
                                <PlayIcon className="h-3  bg-[#FDB077] rounded-full w-3" />
                                In Progress
                              </Button>
                              <Button
                                onClick={() => {
                                  setStatusToUpdate("Completed");
                                  setIsCompleteDialogOpen(true);
                                }}
                                className=" border mt-2 bg-transparent h-6 hover:bg-[#007A5A]  border-gray-600 w-full "
                              >
                                <CheckCheck className="h-4 rounded-full text-green-400" />
                                Completed
                              </Button>


                            </div>
                          </div>

                          <div className="flex justify-end mt-4">

                          </div>
                        </div>
                      </Card>

                      {selectedTask && selectedTask._id === task._id && (
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
                                {task.links?.map((link, index) => (
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
                                <Button
                                  onClick={() => {
                                    setStatusToUpdate("In Progress");
                                    setIsDialogOpen(true);
                                  }}
                                  className="gap-2 border bg-transparent  border-gray-600 w-full"
                                >
                                  <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                                  In Progress
                                </Button>
                                <Button
                                  onClick={() => {
                                    setStatusToUpdate("Completed");
                                    setIsCompleteDialogOpen(true);
                                  }}
                                  className=" border bg-transparent  border-gray-600 w-full "
                                >
                                  <CheckCheck className="h-4 rounded-full text-green-400" />
                                  Completed
                                </Button>
                                <Button
                                  onClick={handleEditClick}
                                  className=" border bg-transparent  border-gray-600 w-full"
                                >
                                  <Edit className="h-4 rounded-full  text-blue-400" />
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
                                  className=" border bg-transparent  border-gray-600 w-full"
                                >
                                  <Trash className="h-4 rounded-full text-red-400" />
                                  Delete
                                </Button>
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
                      )}

                      {isDialogOpen && (
                        <Dialog
                          open={isDialogOpen}
                        >
                          <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
                          <DialogContent className="bg-[#1A1D21]  rounded-lg p-6 mx-auto  max-w-xl ">
                            <DialogTitle>Task Update</DialogTitle>
                            <p>Please add a note before marking the task as in progress</p>
                            <div className="mt-4">
                              <Label>Comment</Label>
                              <div
                                ref={editorRef}
                                contentEditable
                                className="border-gray-600 border rounded-lg outline-none px-2 py-6 w-full mt-2"
                                onInput={(e) => {
                                  const target = e.target as HTMLDivElement;
                                  setComment(target.innerHTML);
                                }}
                              ></div>

                              <div className="flex mt-2">
                                <input type="file" onChange={handleFileChange} className="mt-2" />
                                <h1 onClick={() => { setIsRecordingModalOpen(true) }} className="text-sm mt-3 ml-1 cursor-pointer"> Attach an Audio</h1>
                                {recording ? (
                                  <div onClick={stopRecording} className='h-8 w-8 rounded-full items-center text-center mt-2 border cursor-pointer hover:shadow-white shadow-sm bg-red-500'>
                                    <Mic className='h-5 text-center m-auto mt-1' />
                                  </div>
                                ) : (
                                  <div onClick={startRecording} className='h-8 w-8 rounded-full items-center text-center mt-2 border cursor-pointer hover:shadow-white shadow-sm bg-[#007A5A]'>
                                    <Mic className='h-5 text-center m-auto mt-1' />
                                  </div>
                                )}


                              </div>
                              <canvas ref={canvasRef} className={` ${recording ? `w-full h-1/2` : 'hidden'} `}></canvas>
                              {audioBlob && (
                                <div className="mt-4">
                                  <audio controls src={audioURL} />
                                </div>
                              )}

                              {/* <img src="/icons/image.png" alt="image icon" /> */}
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                              <Button
                                onClick={() => setIsDialogOpen(false)}
                                className="w- text-white bg-gray-500 "
                              >
                                Close
                              </Button>
                              <Button
                                onClick={handleUpdateTaskStatus}
                                className="w-full text-white bg-[#007A5A]"
                              >
                                Update Task
                              </Button>

                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ))
                ) : (
                  <Card
                    className="flex  w-[108%] border-[0.5px] border-[#007A5A]  items-center rounded-lg bg-[#] justify-between cursor-pointer p-6"

                  >
                    <h1 className="text-center font-bold text-xl">
                      No Tasks Found
                    </h1>
                    <img src="/logo.png" className="w-[52.5%] h-[100%] opacity-0" />

                  </Card>
                )}
                <FilterModal
                  isOpen={isModalOpen}
                  closeModal={() => setIsModalOpen(false)}
                  categories={categories}
                  users={users}
                  applyFilters={applyFilters}
                />
              </div>
            </div>
          ) : (
            <div className="grid mt-12 w-full text-sm gap-4">
              <div className="grid  w-full text-xs  gap-4">
                <TaskSummary completedTasks={completedTasks} inProgressTasks={inProgressTasks} overdueTasks={overdueTasks} pendingTasks={pendingTasks} delayedTasks={delayedTasks} inTimeTasks={inTimeTasks} />
              </div>

              <div className="flex px-4 -mt-6 w-[100%]  space-x-2 justify-center ">
                <div className="space-x-2 flex">
                  <div className=" flex px-4 mt-4 space-x-2 justify-center mb-2">
                    <input
                      type="text"
                      placeholder="Search Tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 border outline-none text-[#8A8A8A] ml-auto bg-transparent rounded-md w-"
                    />

                  </div>
                  <Button onClick={() => setIsModalOpen(true)} className="bg-[#007A5A] mt-4"><FilterIcon className="h-4" /> Filter</Button>
                </div>
              </div>
              {filteredTasks!.length > 0 ? (
                filteredTasks!.map((task) => (
                  <div key={task._id} className="">
                    <Card
                      className="flex  w-[100%] border-[0.5px] rounded hover:border-[#74517A] shadow-sm items-center bg-[#] justify-between cursor-pointer px-4 py-1"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className=" items-center gap-4">
                        <div>
                          <p className="font-medium text-sm text-white">{task.title}</p>
                          <p className="text-[#E0E0E0] text-xs">Assigned by <span className="text-[#007A5A] font-bold">
                            {task.user.firstName}
                          </span></p>
                        </div>
                        <div className="flex gap-2">

                          <div className="flex -ml-1  text-xs mt-2">
                            <IconClock className="h-5" />
                            <h1 className="mt-[1.5px]">
                              {formatTaskDate(task.dueDate)}
                            </h1>
                          </div>
                          <h1 className="mt-auto  text-[#E0E0E066] ">|</h1>
                          <div className="flex text-xs mt-[10px]">
                            <UserIcon className="h-4" />
                            {task.assignedUser.firstName}
                          </div>
                          <h1 className="mt-auto text-[#E0E0E066] ">|</h1>

                          <div className="flex text-xs mt-[11px]">
                            <TagIcon className="h-4" />
                            {task.category.name}
                          </div>

                          {task.repeat ? (
                            <div className="flex items-center">
                              <h1 className="mt-auto text-[#E0E0E066] mx-2">|</h1>

                              {task.repeatType && (
                                <h1 className="flex mt-[11px] text-xs">
                                  <Repeat className="h-4 " />  {task.repeatType}
                                </h1>
                              )}
                            </div>
                          ) : null}

                          {/* <div className="flex mt-auto">
                          <TagIcon className="h-5" />
                        </div> */}
                          <h1 className="mt-auto text-[#E0E0E066] ">|</h1>

                          <div className="flex text-xs">
                            <div className="mt-[11px]">
                              <IconProgressBolt className="h-4  " />

                            </div>
                            <h1 className="mt-auto">
                              {task.status}
                            </h1>
                          </div>
                        </div>

                      </div>
                      <div className="">
                        <div className="flex ">
                          <div className="gap-2 w-1/2 mt-4 mb-4 flex">
                            <Button
                              onClick={() => {
                                setStatusToUpdate("In Progress");
                                setIsDialogOpen(true);
                              }}
                              className="gap-2 border mt-2 h-6 bg-transparent hover:bg-[#007A5A]  border-gray-600 w-full"
                            >
                              <PlayIcon className="h-3  bg-[#FDB077] rounded-full w-3" />
                              In Progress
                            </Button>
                            <Button
                              onClick={() => {
                                setStatusToUpdate("Completed");
                                setIsCompleteDialogOpen(true);
                              }}
                              className=" border mt-2 bg-transparent h-6 hover:bg-[#007A5A]  border-gray-600 w-full "
                            >
                              <CheckCheck className="h-4 rounded-full text-green-400" />
                              Completed
                            </Button>


                          </div>
                        </div>

                        <div className="flex justify-end mt-4">

                        </div>
                      </div>
                    </Card>

                    {selectedTask && selectedTask._id === task._id && (
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
                              {task.links?.map((link, index) => (
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
                              <Button
                                onClick={() => {
                                  setStatusToUpdate("In Progress");
                                  setIsDialogOpen(true);
                                }}
                                className="gap-2 border bg-transparent  border-gray-600 w-full"
                              >
                                <PlayIcon className="h-4 bg-[#FDB077] rounded-full w-4" />
                                In Progress
                              </Button>
                              <Button
                                onClick={() => {
                                  setStatusToUpdate("Completed");
                                  setIsCompleteDialogOpen(true);
                                }}
                                className=" border bg-transparent  border-gray-600 w-full "
                              >
                                <CheckCheck className="h-4 rounded-full text-green-400" />
                                Completed
                              </Button>
                              <Button
                                onClick={handleEditClick}
                                className=" border bg-transparent  border-gray-600 w-full"
                              >
                                <Edit className="h-4 rounded-full  text-blue-400" />
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
                                className=" border bg-transparent  border-gray-600 w-full"
                              >
                                <Trash className="h-4 rounded-full text-red-400" />
                                Delete
                              </Button>
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
                    )}

                    {isDialogOpen && (
                      <Dialog
                        open={isDialogOpen}
                      >
                        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
                        <DialogContent className="bg-[#1A1D21]  rounded-lg p-6 mx-auto  max-w-xl ">
                          <DialogTitle>Task Update</DialogTitle>
                          <p>Please add a note before marking the task as in progress</p>
                          <div className="mt-4">
                            <Label>Comment</Label>
                            <div
                              ref={editorRef}
                              contentEditable
                              className="border-gray-600 border rounded-lg outline-none px-2 py-6 w-full mt-2"
                              onInput={(e) => {
                                const target = e.target as HTMLDivElement;
                                setComment(target.innerHTML);
                              }}
                            ></div>

                            <div className="flex mt-2">
                              <input type="file" onChange={handleFileChange} className="mt-2" />
                              <h1 onClick={() => { setIsRecordingModalOpen(true) }} className="text-sm mt-3 ml-1 cursor-pointer"> Attach an Audio</h1>
                              {recording ? (
                                <div onClick={stopRecording} className='h-8 w-8 rounded-full items-center text-center mt-2 border cursor-pointer hover:shadow-white shadow-sm bg-red-500'>
                                  <Mic className='h-5 text-center m-auto mt-1' />
                                </div>
                              ) : (
                                <div onClick={startRecording} className='h-8 w-8 rounded-full items-center text-center mt-2 border cursor-pointer hover:shadow-white shadow-sm bg-[#007A5A]'>
                                  <Mic className='h-5 text-center m-auto mt-1' />
                                </div>
                              )}


                            </div>
                            <canvas ref={canvasRef} className={` ${recording ? `w-full h-1/2` : 'hidden'} `}></canvas>
                            {audioBlob && (
                              <div className="mt-4">
                                <audio controls src={audioURL} />
                              </div>
                            )}

                            {/* <img src="/icons/image.png" alt="image icon" /> */}
                          </div>
                          <div className="mt-4 flex justify-end space-x-2">
                            <Button
                              onClick={() => setIsDialogOpen(false)}
                              className="w- text-white bg-gray-500 "
                            >
                              Close
                            </Button>
                            <Button
                              onClick={handleUpdateTaskStatus}
                              className="w-full text-white bg-[#007A5A]"
                            >
                              Update Task
                            </Button>

                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                ))
              ) : (
                <Card
                  className="flex  w-[108%] border-[0.5px] border-[#007A5A]  items-center rounded-lg bg-[#] justify-between cursor-pointer p-6"

                >
                  <h1 className="text-center font-bold text-xl">
                    No Tasks Found
                  </h1>
                  <img src="/logo.png" className="w-[52.5%] h-[100%] opacity-0" />

                </Card>
              )}
              <FilterModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                categories={categories}
                users={users}
                applyFilters={applyFilters}
              />
            </div>
          )}
          {isCompleteDialogOpen && (
            <Dialog
              open={isCompleteDialogOpen}
            >
              <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
              <DialogContent className="bg-[#1A1D21]  rounded-lg p-6 mx-auto  max-w-lg -mt-1">
                <DialogTitle>Task Update</DialogTitle>
                <p>Please add a note before marking the task completed</p>
                <div className="mt-4">
                  <Label>Comment</Label>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="border rounded-lg px-2 py-1 w-full mt-2"
                  />
                  <div className="flex mt-2">
                    <input type="file" onChange={handleFileChange} className="mt-2" />
                    <h1 onClick={() => { setIsRecordingModalOpen(true) }} className="text-sm mt-3 ml-1 cursor-pointer"> Attach an Audio</h1>
                    {recording ? (
                      <div onClick={stopRecording} className='h-8 w-8 rounded-full items-center text-center mt-2 border cursor-pointer hover:shadow-white shadow-sm bg-red-500'>
                        <Mic className='h-5 text-center m-auto mt-1' />
                      </div>
                    ) : (
                      <div onClick={startRecording} className='h-8 w-8 rounded-full items-center text-center mt-2 border cursor-pointer hover:shadow-white shadow-sm bg-[#007A5A]'>
                        <Mic className='h-5 text-center m-auto mt-1' />
                      </div>
                    )}


                  </div>
                  <canvas ref={canvasRef} className={` ${recording ? `w-full h-1/2` : 'hidden'} `}></canvas>
                  {audioBlob && (
                    <div className="mt-4">
                      <audio controls src={audioURL} />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    onClick={() => setIsCompleteDialogOpen(false)}
                    className="w- text-white bg-gray-500 "
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleUpdateTaskStatus}
                    className="w-full bg-[#007A5A] text-white"
                  >
                    Update Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>



    </div >
  );
}
