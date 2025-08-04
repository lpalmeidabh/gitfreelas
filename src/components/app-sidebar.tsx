'use client'

import * as React from 'react'

import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { WalletStatusCard } from '@/components/web3/wallet-status-card'
import { Circle, Plus, Search, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationData = {
  main: [
    // {
    //   title: 'Dashboard',
    //   url: '/dashboard',
    //   icon: LayoutDashboard,
    // },
    {
      title: 'Criar Tarefa',
      url: '/tasks/create',
      icon: Plus,
    },
    {
      title: 'Explorar Tarefas',
      url: '/tasks',
      icon: Search,
    },

    {
      title: 'Minhas Tarefas',
      url: '/tasks/my-tasks',
      icon: User,
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
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <Circle className="!size-5 text-primary" />
                <span className="text-base font-semibold">GitFreelas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.main.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Links de Desenvolvimento/Debug
        <SidebarGroup>
          <SidebarGroupLabel>Debug & Testes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/test-github">
                    <GitBranch />
                    <span>Teste GitHub API</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>

      <SidebarFooter>
        <WalletStatusCard />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
