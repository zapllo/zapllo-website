import Category from "@/components/icons/category";
import Logs from "@/components/icons/clipboard";
import Templates from "@/components/icons/cloud_download";
import Home from "@/components/icons/home";
import Payment from "@/components/icons/payment";
import Settings from "@/components/icons/settings";
import Tasks from "@/components/icons/tasks";
import Workflows from "@/components/icons/workflows";
import { DashboardIcon } from "@radix-ui/react-icons";

export const menuOptions = [
    { name: 'Dashboard', Component: Home, href: '/dashboard' },
    { name: 'Tasks', Component: Tasks, href: '/dashboard/tasks' },
    { name: 'Settings', Component: Settings, href: '/settings' },
    { name: 'Connections', Component: Category, href: '/connections' },
    { name: 'Billing', Component: Payment, href: '/billing' },
    { name: 'Templates', Component: Templates, href: '/templates' },
    { name: 'Logs', Component: Logs, href: '/logs' },
]

export const taskOptions = [
    { name: 'Dashboard', Component: DashboardIcon, href: '/dashboard/tasks' },
    { name: 'My Tasks', Component: Tasks, href: '/dashboard/tasks/assigned' },
    { name: 'Delegated Tasks', Component: Tasks, href: '/dashboard/tasks/delegated' },
    { name: 'All Tasks', Component: Tasks, href: '/dashboard/tasks/allTasks' },
    { name: 'Calendar View', Component: Tasks, href: '/dashboard/tasks/calendar' },
]