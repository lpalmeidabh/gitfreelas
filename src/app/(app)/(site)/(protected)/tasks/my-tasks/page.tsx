// src/app/(app)/(site)/(protected)/tasks/page.tsx

import { getMyTasks } from '@/actions/tasks'
import { TaskList } from '@/components/tasks/listing/task-list'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Tarefas Disponíveis | GitFreelas',
  description: 'Encontre tarefas de desenvolvimento e ganhe em cripto',
}

export default async function MyTasksPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/')
  }

  const currentUserId = session.user.id

  const myTasksData = await getMyTasks()

  return (
    <div className="space-y-8 p-8">
      <TaskList
        initialData={{
          tasks: myTasksData?.createdTasks || [],
        }}
        title="Tarefas que Criei"
        description="Gerencie suas tarefas criadas"
      />

      {/* Tarefas onde apliquei */}
      <TaskList
        initialData={{
          tasks: myTasksData?.appliedTasks || [],
        }}
        title="Tarefas Onde Apliquei"
        description="Acompanhe suas aplicações"
      />
    </div>
  )
}
