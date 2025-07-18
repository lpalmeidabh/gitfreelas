import { ApplyTaskButton } from '@/components/tasks/apply/apply-task-button'
import { TaskApplicationReview } from '@/components/tasks/approval/task-application-review'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { TaskWithRelations } from '@/types'

interface TaskActionsProps {
  task: TaskWithRelations
  currentUserId?: string
  searchParams?: {
    action?: string
  }
}

export function TaskActions({
  task,
  currentUserId,
  searchParams,
}: TaskActionsProps) {
  const isOwner = currentUserId === task.creatorId
  const canApply = !isOwner && task.status === 'OPEN' && !task.taskDeveloper

  return (
    <div className="space-y-6">
      {/* Botão de aplicação */}
      {canApply && (
        <ApplyTaskButton
          task={task}
          currentUserId={currentUserId}
          variant="default"
          size="lg"
          className="w-full"
        />
      )}

      {/* Review de aplicações - CORRIGIDO: passa task ao invés de taskId */}
      {isOwner && task.status === 'APPLIED' && (
        <TaskApplicationReview task={task} />
      )}

      {/* Ações baseadas no searchParams */}
      {searchParams?.action === 'submit' && !isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Submeter Trabalho</CardTitle>
            <CardDescription>
              Envie seu trabalho concluído para aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Formulário de submissão em desenvolvimento...
            </p>
          </CardContent>
        </Card>
      )}

      {searchParams?.action === 'approve' && isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Aprovar Entrega</CardTitle>
            <CardDescription>
              Revise e aprove o trabalho entregue pelo desenvolvedor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Interface de aprovação em desenvolvimento...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
