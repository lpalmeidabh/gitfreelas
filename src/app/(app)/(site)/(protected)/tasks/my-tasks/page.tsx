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
      <span className="flex mb-10 font-bold text-3xl">Minhas tarefas</span>
      <TaskList
        initialData={{
          tasks: myTasksData?.appliedTasks || [],
        }}
        title="Como Desenvolvedor"
      />
      <TaskList
        initialData={{
          tasks: myTasksData?.createdTasks || [],
        }}
        title="Como Cliente"
      />
    </div>
  )
}
