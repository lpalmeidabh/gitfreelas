import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, User, FileEdit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TaskActions } from './task-actions'
import { TaskValueInfo } from './task-value-info'
import { TransactionHistory } from './transaction-history'
import type { TaskWithRelations } from '@/types'

interface TaskInfoProps {
  task: TaskWithRelations
  currentUserId?: string
  searchParams?: {
    action?: string
  }
}

export function TaskInfo({ task, currentUserId, searchParams }: TaskInfoProps) {
  return (
    <>
      {/* Card de detalhes com actions no footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Descrição da Tarefa
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{task.description}</p>
          </div>

          {task.requirements && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Requisitos Técnicos</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.requirements}
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Prazo:{' '}
                  {formatDistanceToNow(new Date(task.deadline), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              {task.allowOverdue && (
                <span className="text-orange-600">
                  Permite 3 dias extras com desconto
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-6 border-t">
          <TaskActions
            task={task}
            currentUserId={currentUserId}
            searchParams={searchParams}
          />
        </CardFooter>
      </Card>

      {/* TRÊS cards na linha: Pessoas | Valor | Histórico */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Card Pessoas */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Pessoas Envolvidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Cliente</h4>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.creator.image || ''} />
                  <AvatarFallback>
                    {task.creator.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{task.creator.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.creator.email}
                  </p>
                </div>
              </div>
            </div>

            {task.taskDeveloper && task.status === 'IN_PROGRESS' && (
              <div>
                <h4 className="font-medium mb-2">Desenvolvedor</h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={task.taskDeveloper.developer.image || ''}
                    />
                    <AvatarFallback>
                      {task.taskDeveloper.developer.name
                        ?.charAt(0)
                        .toUpperCase() || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {task.taskDeveloper.developer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.taskDeveloper.developer.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Valor */}
        <div className="flex-1">
          <TaskValueInfo
            valueInWei={task.valueInWei}
            contractTaskId={task.contractTaskId}
          />
        </div>

        {/* Card Histórico */}
        <div className="flex-1">
          <TransactionHistory transactions={task.transactions} />
        </div>
      </div>
    </>
  )
}
