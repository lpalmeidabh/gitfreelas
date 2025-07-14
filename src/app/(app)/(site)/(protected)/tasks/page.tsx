// src/app/(app)/(site)/(protected)/tasks/page.tsx

import { TaskListing } from '@/components/tasks/task-listing'
import { getTasks, getMyTasks } from '@/actions/tasks'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { TaskStatus } from '@/lib/generated/prisma/client'

export const metadata = {
  title: 'Tarefas Disponíveis | GitFreelas',
  description: 'Encontre tarefas de desenvolvimento e ganhe em cripto',
}

interface TasksPageProps {
  searchParams: Promise<{
    tab?: string
    status?: string
    search?: string
    sort?: string
    page?: string
  }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/')
  }

  const params = await searchParams
  const currentTab = params.tab || 'available'
  const currentUserId = session.user.id

  let availableTasksData = null
  let myTasksData = null

  if (currentTab === 'available') {
    const filters = {
      status: [TaskStatus.OPEN],
      search: params.search,
    }

    const sort = (params.sort as any) || 'newest'
    const page = parseInt(params.page || '1')

    availableTasksData = await getTasks(filters, sort, page, 10)
  } else if (currentTab === 'my-tasks') {
    myTasksData = await getMyTasks()
  }

  return (
    <TaskListing
      initialTab={currentTab}
      availableTasksData={availableTasksData}
      myTasksData={myTasksData}
      currentUserId={currentUserId}
      initialParams={{
        search: params.search,
        sort: params.sort,
        page: params.page,
      }}
    />
  )
}
