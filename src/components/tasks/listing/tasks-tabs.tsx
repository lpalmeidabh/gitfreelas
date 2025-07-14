// src/components/tasks/listing/tasks-tabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, User } from 'lucide-react'
import Link from 'next/link'

interface TasksTabsProps {
  currentTab: string
  onTabChange: (tab: string) => void
  availableTasksContent: React.ReactNode
  myTasksContent: React.ReactNode
}

export function TasksTabs({
  currentTab,
  onTabChange,
  availableTasksContent,
  myTasksContent,
}: TasksTabsProps) {
  return (
    <Tabs value={currentTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
        <TabsTrigger value="available" asChild>
          <Link href="/tasks?tab=available" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Tarefas Disponíveis
          </Link>
        </TabsTrigger>
        <TabsTrigger value="my-tasks" asChild>
          <Link href="/tasks?tab=my-tasks" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Minhas Tarefas
          </Link>
        </TabsTrigger>
      </TabsList>

      {/* Tarefas Disponíveis */}
      <TabsContent value="available" className="space-y-6">
        {availableTasksContent}
      </TabsContent>

      {/* Minhas Tarefas */}
      <TabsContent value="my-tasks" className="space-y-6">
        {myTasksContent}
      </TabsContent>
    </Tabs>
  )
}
