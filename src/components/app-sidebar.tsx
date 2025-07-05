'use client'

import * as React from 'react'

import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Camera,
  ChartBar,
  Circle,
  FileCode,
  Folder,
  HelpCircle,
  LayoutDashboard,
  LifeBuoyIcon,
  Search,
  Settings,
  Users,
  FilePenLine,
} from 'lucide-react'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: LayoutDashboard,
    },
    {
      title: 'Lifecycle',
      url: '#',
      icon: LifeBuoyIcon,
    },
    {
      title: 'Analytics',
      url: '#',
      icon: ChartBar,
    },
    {
      title: 'Projects',
      url: '#',
      icon: Folder,
    },
    {
      title: 'Team',
      url: '#',
      icon: Users,
    },
  ],

  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: Settings,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: HelpCircle,
    },
    {
      title: 'Search',
      url: '#',
      icon: Search,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
  }
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Circle className="!size-5" />
                <span className="text-base font-semibold">git.freelas</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
