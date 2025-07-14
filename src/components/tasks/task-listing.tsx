// src/components/tasks/task-listing.tsx
'use client'

import { useState } from 'react'
import { TasksHeader } from './listing/tasks-header'
import { TasksStats } from './listing/tasks-stats'
import { TasksTabs } from './listing/tasks-tabs'
import { TasksSidebar } from './listing/tasks-sidebar'
import { TaskList } from './listing/task-list'
import { TaskListResponse } from '@/types'

interface TaskListingProps {
  initialTab: string
  availableTasksData: TaskListResponse | null
  myTasksData: any | null
  currentUserId: string
  initialParams: {
    search?: string
    sort?: string
    page?: string
  }
}

export function TaskListing({
  initialTab,
  availableTasksData,
  myTasksData,
  currentUserId,
  initialParams,
}: TaskListingProps) {
  const [currentTab, setCurrentTab] = useState(initialTab)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <TasksHeader />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Estatísticas Rápidas */}
            <TasksStats />

            {/* Abas principais */}
            <TasksTabs
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              availableTasksContent={
                <TaskList
                  initialData={availableTasksData || undefined}
                  currentUserId={currentUserId}
                  showFilters={true}
                  title="Tarefas Disponíveis"
                  description="Tarefas abertas aguardando desenvolvedores. Aplique-se agora!"
                />
              }
              myTasksContent={
                <div className="space-y-8">
                  {/* Tarefas que criei */}
                  <TaskList
                    initialData={{
                      tasks: myTasksData?.createdTasks || [],
                      total: myTasksData?.createdTasks?.length || 0,
                      page: 1,
                      limit: 50,
                    }}
                    currentUserId={currentUserId}
                    showFilters={false}
                    title="Tarefas que Criei"
                    description="Gerencie suas tarefas criadas"
                  />

                  {/* Tarefas onde apliquei */}
                  <TaskList
                    initialData={{
                      tasks: myTasksData?.appliedTasks || [],
                      total: myTasksData?.appliedTasks?.length || 0,
                      page: 1,
                      limit: 50,
                    }}
                    currentUserId={currentUserId}
                    showFilters={false}
                    title="Tarefas Onde Apliquei"
                    description="Acompanhe suas aplicações"
                  />
                </div>
              }
            />
          </div>

          {/* Sidebar */}
          <TasksSidebar />
        </div>
      </div>
    </div>
  )
}
