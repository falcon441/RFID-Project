import {
  LayoutDashboard, Radar, LogIn, LogOut, Truck, Tag, DoorOpen, Timer, FileBarChart,
  TriangleAlert, Users, Network, ScrollText, Settings, type LucideIcon,
} from "lucide-react";

export interface NavItem { title: string; to: string; icon: LucideIcon; group: string }
export const NAV: NavItem[] = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard, group: "Operations" },
  { title: "Live Vehicle Monitoring", to: "/live", icon: Radar, group: "Operations" },
  { title: "Entry Transactions", to: "/entries", icon: LogIn, group: "Operations" },
  { title: "Exit Transactions", to: "/exits", icon: LogOut, group: "Operations" },
  { title: "Vehicle Management", to: "/vehicles", icon: Truck, group: "Registry" },
  { title: "RFID Tag Management", to: "/rfid-tags", icon: Tag, group: "Registry" },
  { title: "Gate Management", to: "/gates", icon: DoorOpen, group: "Registry" },
  { title: "Dwell-Time Analytics", to: "/dwell-time", icon: Timer, group: "Insights" },
  { title: "Reports", to: "/reports", icon: FileBarChart, group: "Insights" },
  { title: "Alerts & Exceptions", to: "/alerts", icon: TriangleAlert, group: "Insights" },
  { title: "User Management", to: "/users", icon: Users, group: "Administration" },
  { title: "External System Integration", to: "/integrations", icon: Network, group: "Administration" },
  { title: "Audit Logs", to: "/audit-logs", icon: ScrollText, group: "Administration" },
  { title: "System Settings", to: "/settings", icon: Settings, group: "Administration" },
];
