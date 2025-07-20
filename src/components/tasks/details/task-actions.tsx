import { ApplyTaskButton } from '@/components/tasks/apply/apply-task-button'
import { TaskApplicationReview } from '@/components/tasks/approval/task-application-review'
import dynamic from 'next/dynamic'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { TaskWithRelations } from '@/types'

// Carregamento dinâmico do TaskCodeReview (só carrega quando necessário)
const TaskCodeReview = dynamic(
  () =>
    import('@/components/tasks/review/task-code-review').then((mod) => ({
      default: mod.TaskCodeReview,
    })),
  {
    ssr: false, // Não renderizar no servidor
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Code Review...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    ),
  },
)

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
    <div className="w-full space-y-6">
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

      {/* Review de aplicações */}
      {isOwner && task.status === 'APPLIED' && (
        <TaskApplicationReview task={task} />
      )}

      {/* Code Review - AGORA COM LAZY LOADING */}
      {isOwner && task.status === 'PENDING_APPROVAL' && (
        <TaskCodeReview task={task} />
      )}

      {/* Ações baseadas no searchParams */}
      {searchParams?.action === 'submit' && !isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Submeter Trabalho</CardTitle>
            <CardDescription>
              Crie um Pull Request no repositório para submeter seu trabalho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Para submeter seu trabalho:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Finalize o desenvolvimento no repositório</li>
                <li>Faça commits organizados e descritivos</li>
                <li>Crie um Pull Request para a branch principal</li>
                <li>Aguarde a revisão do cliente</li>
              </ol>

              {task.repository && (
                <div className="mt-4">
                  <a
                    href={task.repository.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    Ir para o Repositório →
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {searchParams?.action === 'approve' &&
        isOwner &&
        task.status === 'PENDING_APPROVAL' && <TaskCodeReview task={task} />}
    </div>
  )
}
