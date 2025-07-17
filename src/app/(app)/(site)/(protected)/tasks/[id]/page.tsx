import { getTaskById } from '@/actions/tasks'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

// Componentes modulares
import { TaskHeader } from '@/components/tasks/details/task-header'
import { TaskInfo } from '@/components/tasks/details/task-info'
import { TransactionHistory } from '@/components/tasks/details/transaction-history'
import { TaskActions } from '@/components/tasks/details/task-actions'

interface TaskDetailsPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    action?: string
  }>
}

export default async function TaskDetailsPage({
  params,
  searchParams,
}: TaskDetailsPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  // Verificar autenticação
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Buscar dados da tarefa
  const task = await getTaskById(resolvedParams.id)
  if (!task) {
    notFound()
  }

  return (
    <div className="p-6 space-y-8">
      <TaskHeader title={task.title} status={task.status} />
      <TaskInfo
        task={task}
        currentUserId={session?.user?.id}
        searchParams={resolvedSearchParams}
      />
    </div>
  )
}
