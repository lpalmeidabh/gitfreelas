'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TaskWithRelations, TASK_STATUS_LABELS } from '@/types'
import { weiToEther } from '@/lib/web3/config'
import {
  Calendar,
  User,
  Wallet,
  Clock,
  CheckCircle,
  AlertTriangle,
  Circle,
  Play,
  Pause,
  X,
  Undo,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: TaskWithRelations
  showActions?: boolean
  variant?: 'default' | 'compact'
  currentUserId?: string
}

const statusIcons = {
  OPEN: Circle,
  APPLIED: Clock,
  IN_PROGRESS: Play,
  PENDING_APPROVAL: Pause,
  COMPLETED: CheckCircle,
  CANCELLED: X,
  OVERDUE: AlertTriangle,
  REFUNDED: Undo,
}

export function TaskCard({
  task,
  showActions = true,
  variant = 'default',
  currentUserId,
}: TaskCardProps) {
  const StatusIcon = statusIcons[task.status]
  const statusInfo = TASK_STATUS_LABELS[task.status]

  // Verificar relação do usuário atual com a tarefa
  const isOwner = currentUserId === task.creatorId
  const isDeveloper = currentUserId === task.taskDeveloper?.developerId
  const canApply = !isOwner && !task.taskDeveloper && task.status === 'OPEN'

  // Calcular se está próximo do deadline
  const daysUntilDeadline = Math.ceil(
    (new Date(task.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  )

  const isUrgent = daysUntilDeadline <= 2 && daysUntilDeadline > 0
  const isOverdue = daysUntilDeadline < 0

  const formatValue = (weiValue: string) => {
    const ethValue = weiToEther(weiValue)
    return `${parseFloat(ethValue).toFixed(4)} ETH`
  }

  const formatDeadline = (deadline: Date) => {
    return formatDistanceToNow(new Date(deadline), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className={cn('h-4 w-4', statusInfo.color)} />
                <Badge variant="outline" className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
                {isUrgent && (
                  <Badge variant="destructive" className="text-xs">
                    Urgente
                  </Badge>
                )}
              </div>

              <h4 className="font-medium truncate mb-1">{task.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  {formatValue(task.valueInWei)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDeadline(task.deadline)}
                </span>
              </div>
            </div>

            <Link href={`/tasks/${task.id}`}>
              <Button size="sm" variant="outline">
                Ver
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={cn('h-4 w-4', statusInfo.color)} />
              <Badge variant="outline" className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
              {isUrgent && <Badge variant="destructive">Urgente</Badge>}
              {isOverdue && <Badge variant="destructive">Vencida</Badge>}
              {task.allowOverdue && (
                <Badge variant="secondary" className="text-xs">
                  +3 dias extras
                </Badge>
              )}
            </div>

            <CardTitle className="line-clamp-2">{task.title}</CardTitle>
            <CardDescription className="line-clamp-3 mt-2">
              {task.description}
            </CardDescription>
          </div>

          <div className="text-right">
            <div className="font-bold text-lg">
              {formatValue(task.valueInWei)}
            </div>
            <div className="text-xs text-muted-foreground">Valor da tarefa</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Criador */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.creator.image} />
                <AvatarFallback className="text-xs">
                  {task.creator.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{task.creator.name}</span>
              {isOwner && (
                <Badge variant="secondary" className="text-xs">
                  Você
                </Badge>
              )}
            </div>
          </div>

          {/* Desenvolvedor (se aplicado) */}
          {task.taskDeveloper && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.taskDeveloper.developer.image} />
                  <AvatarFallback className="text-xs">
                    {task.taskDeveloper.developer.name
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {task.taskDeveloper.developer.name}
                </span>
                {isDeveloper && (
                  <Badge variant="secondary" className="text-xs">
                    Você
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Deadline */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Prazo: {formatDeadline(task.deadline)}
            </span>
            {isUrgent && !isOverdue && (
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-600"
              >
                {daysUntilDeadline} dia{daysUntilDeadline !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Requirements */}
          {task.requirements && (
            <div className="text-sm text-muted-foreground">
              <strong>Requisitos:</strong> {task.requirements}
            </div>
          )}

          {/* Repository */}
          {task.repository && (
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-green-500" />
              <a
                href={task.repository.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {task.repository.repositoryName}
              </a>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2">
          <Link href={`/tasks/${task.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Ver Detalhes
            </Button>
          </Link>

          {canApply && (
            <Link href={`/tasks/${task.id}?action=apply`} className="flex-1">
              <Button className="w-full">Aplicar</Button>
            </Link>
          )}

          {isOwner && task.status === 'APPLIED' && (
            <Link href={`/tasks/${task.id}?action=review`} className="flex-1">
              <Button variant="secondary" className="w-full">
                Revisar Aplicação
              </Button>
            </Link>
          )}

          {isDeveloper && task.status === 'IN_PROGRESS' && (
            <Link href={`/tasks/${task.id}?action=submit`} className="flex-1">
              <Button variant="secondary" className="w-full">
                Submeter
              </Button>
            </Link>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
