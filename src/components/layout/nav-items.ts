import {
  Building2,
  Cake,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  UserCog,
  Users,
  Wifi,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  key: string;
  icon: LucideIcon;
  end?: boolean;
}

/** Single source of truth for the main menu (used by header nav and sidebar). */
export const navItems: NavItem[] = [
  { to: '/', key: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/attendance', key: 'attendance', icon: ClipboardList },
  { to: '/approvals', key: 'approvals', icon: ClipboardCheck },
  { to: '/birthdays', key: 'birthdays', icon: Cake },
  { to: '/employees', key: 'employees', icon: Users },
  { to: '/departments', key: 'departments', icon: Building2 },
  { to: '/schedules', key: 'schedules', icon: CalendarClock },
  { to: '/wifi', key: 'wifi', icon: Wifi },
  { to: '/users', key: 'users', icon: UserCog },
];
