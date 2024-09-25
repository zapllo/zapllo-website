import Category from "@/components/icons/category";
import Clipboard from "@/components/icons/clipboard";
import Logs from "@/components/icons/clipboard";
import Templates from "@/components/icons/cloud_download";
import Home from "@/components/icons/home";
import Ticket from "@/components/icons/ticket";
import Payment from "@/components/icons/payment";
import Settings from "@/components/icons/settings";
import Tasks from "@/components/icons/tasks";
import Workflows from "@/components/icons/workflows";
import { DashboardIcon, GearIcon, CardStackIcon, CheckboxIcon, GridIcon, PersonIcon, PieChartIcon, } from "@radix-ui/react-icons";
import { IconBrandTeams } from "@tabler/icons-react";
import { HomeIcon, IndianRupee, Megaphone, UserCheck2, UserPlus, Users, UsersIcon, UsersRound, UsersRoundIcon } from "lucide-react";
import Intranet from "@/components/icons/intranet";
import Leaves from "@/components/icons/leaves";

export const menuOptions = [
  { name: "Dashboard", Component: Home, href: "/dashboard" },
  { name: "Tasks", Component: Tasks, href: "/dashboard/tasks" },
  { name: "Intranet", Component: Intranet, href: "/intranet" },
  { name: "Leaves & Attendance", Component: Leaves, href: "/attendance" },
  { name: "Teams", Component: Category, href: "/dashboard/teams" },
  { name: "Settings", Component: Settings, href: "/dashboard/settings" },
  { name: "Billing", Component: Payment, href: "/dashboard/billing" },
  { name: "Help", Component: Clipboard, href: "/help/tutorials" },
];


export const settingsOptions = [
  { name: "General", Component: GearIcon, href: "/dashboard/settings" },
  { name: "Categories", Component: PieChartIcon, href: "/dashboard/settings/categories" },
  // { name: "Billing", Component: CardStackIcon, href: "/dashboard/billing" },
];
export const adminOptions = [
  { name: "Dashboard", Component: Home, href: "/admin/dashboard" },
  { name: "Tickets", Component: Ticket, href: "/admin/tickets" },
  { name: "Users", Component: Category, href: "/admin/users" },
  { name: "Workspaces", Component: Category, href: "/admin/workspaces" },
  { name: "Announcements", Component: Megaphone, href: "/admin/dashboard/announcements" },
  { name: "Admin", Component: Payment, href: "/admin/dashboard/admin" },
  { name: "Help", Component: Clipboard, href: "/tutorials" },
];


export const taskOptions = [
  { name: "Dashboard", Component: DashboardIcon, href: "/dashboard/tasks" },
  { name: "My Tasks", Component: Tasks, href: "/dashboard/tasks/assigned" },
  {
    name: "Delegated Tasks",
    Component: Tasks,
    href: "/dashboard/tasks/delegated",
  },
  { name: "All Tasks", Component: Tasks, href: "/dashboard/tasks/allTasks" },
  {
    name: "Calendar View",
    Component: Tasks,
    href: "/dashboard/tasks/calendar",
  },
];

export const businessCategories: string[] = [
  "Sales",
  "Marketing",
  "Operations",
  "Admin",
  "HR",
  "Automation",
  "General",
];
