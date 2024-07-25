import Category from "@/components/icons/category";
import Logs from "@/components/icons/clipboard";
import Templates from "@/components/icons/cloud_download";
import Home from "@/components/icons/home";
import Payment from "@/components/icons/payment";
import Settings from "@/components/icons/settings";
import Tasks from "@/components/icons/tasks";
import Workflows from "@/components/icons/workflows";
import { DashboardIcon, GearIcon, CardStackIcon, CheckboxIcon, GridIcon, PersonIcon, PieChartIcon, } from "@radix-ui/react-icons";
import { IconBrandTeams } from "@tabler/icons-react";
import { IndianRupee, UserCheck2, UserPlus, Users, UsersIcon, UsersRound, UsersRoundIcon } from "lucide-react";

export const menuOptions = [
  { name: "Dashboard", Component: GridIcon, href: "/dashboard" },
  { name: "Tasks", Component: CheckboxIcon, href: "/dashboard/tasks" },
  { name: "Teams", Component: PersonIcon, href: "/dashboard/teams" },
  { name: "Settings", Component: GearIcon, href: "/dashboard/settings" },
  { name: "Billing", Component: CardStackIcon, href: "/dashboard/billing" },
];


export const settingsOptions = [
  { name: "General", Component: GearIcon, href: "/dashboard/settings" },
  { name: "Categories", Component: PieChartIcon, href: "/dashboard/settings/categories" },
  // { name: "Billing", Component: CardStackIcon, href: "/dashboard/billing" },
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
