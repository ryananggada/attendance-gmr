import {
  Building2Icon,
  CalendarIcon,
  HomeIcon,
  LandmarkIcon,
  LogOutIcon,
  NotebookTabsIcon,
  UsersIcon,
} from 'lucide-react';
import { NavMain } from './nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from './ui/sidebar';
import { useAuth } from '@/contexts/auth-context';

const data = {
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: HomeIcon,
    },
    {
      title: 'Attendance',
      url: '/attendance',
      icon: CalendarIcon,
    },
    {
      title: 'Field Attendance',
      url: '/field-attendance',
      icon: LandmarkIcon,
      field: true,
    },
    {
      title: 'Users',
      url: '/users',
      icon: UsersIcon,
      roles: ['Admin'],
    },
    {
      title: 'Departments',
      url: '/departments',
      icon: Building2Icon,
      roles: ['Admin'],
    },
    {
      title: 'Attendance Summary',
      url: '/attendance-summary',
      icon: NotebookTabsIcon,
      roles: ['Admin'],
    },
  ],
};

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();

  const filteredNav = data.navMain.filter((item) => {
    if (item.roles && (!user?.role || !item.roles.includes(user.role))) {
      return false;
    }

    if (item.field !== undefined && item.field !== user!.department.isField) {
      return false;
    }

    return true;
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOutIcon />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
