'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { DeveloperProfileCard } from '@/components/developer-profile-card'
import {
  formatTimeDistance,
  isDateOverdue,
  getDaysUntilDate,
  isDateUrgent,
} from '@/lib/date-utils'
import {
  Calendar,
  Circle,
  Clock,
  DollarSign,
  User,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import type { TaskWithRelations } from '@/types'

interface TaskCardProps {
  task: TaskWithRelations
  currentUserId?: string
  showActions?: boolean
}

export function TaskCard({
  task,
  currentUserId,
  showActions = true,
}: TaskCardProps) {
  const isOverdue = isDateOverdue(task.deadline)
  const daysUntilDeadline = getDaysUntilDate(task.deadline) || 0
  const isUrgent = isDateUrgent(task.deadline)

  const isOwner = currentUserId === task.creatorId
  const isDeveloper = task.taskDeveloper?.developerId === currentUserId

  const formatValue = (valueInWei: string) => {
    const ethValue = parseFloat(valueInWei) / 1e18
    return `${ethValue.toFixed(4)} ETH`
  }

  const getStatusInfo = () => {
    switch (task.status) {
      case 'OPEN':
        return {
          label: 'Aberta',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
        }
      case 'APPLIED':
        return {
          label: 'Aplicada',
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
        }
      case 'IN_PROGRESS':
        return {
          label: 'Em Progresso',
          color: 'bg-purple-100 text-purple-800',
          icon: Clock,
        }
      case 'PENDING_APPROVAL':
        return {
          label: 'Aguardando Aprovação',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
        }
      case 'COMPLETED':
        return {
          label: 'Concluída',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
        }
      case 'CANCELLED':
        return {
          label: 'Cancelada',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertTriangle,
        }
      case 'OVERDUE':
        return {
          label: 'Vencida',
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
        }
      default:
        return {
          label: 'Status desconhecido',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertTriangle,
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className="h-4 w-4" />
              <Badge
                variant="outline"
                className={`${statusInfo.color} font-medium`}
              >
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
        <div className="space-y-4">
          {/* Cliente */}
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

          {/* Desenvolvedor - USANDO DeveloperProfileCard COMPACTO */}
          {task.taskDeveloper && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Desenvolvedor:</span>
                {isDeveloper && (
                  <Badge variant="secondary" className="text-xs">
                    Você
                  </Badge>
                )}
              </div>

              {/* Card compacto do desenvolvedor */}
              <DeveloperProfileCard
                developer={task.taskDeveloper.developer}
                walletAddress={task.taskDeveloper.walletAddress}
                appliedAt={task.taskDeveloper.appliedAt}
                showBadges={false}
                className="p-2 bg-muted/30 border-0"
              />
            </div>
          )}

          {/* Deadline - USANDO HELPER */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Prazo: {formatTimeDistance(task.deadline)}
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
          {/* Botão inteligente único */}
          {isOwner && task.status === 'APPLIED' ? (
            <Link href={`/tasks/${task.id}?action=review`} className="flex-1">
              <Button variant="default" className="w-full">
                Revisar Aplicação
              </Button>
            </Link>
          ) : isDeveloper && task.status === 'IN_PROGRESS' ? (
            <Link href={`/tasks/${task.id}?action=submit`} className="flex-1">
              <Button variant="default" className="w-full">
                Submeter Trabalho
              </Button>
            </Link>
          ) : isOwner && task.status === 'PENDING_APPROVAL' ? (
            <Link href={`/tasks/${task.id}?action=approve`} className="flex-1">
              <Button variant="default" className="w-full">
                Aprovar Entrega
              </Button>
            </Link>
          ) : !isOwner && !isDeveloper && task.status === 'OPEN' ? (
            <Link href={`/tasks/${task.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Ver Detalhes
              </Button>
            </Link>
          ) : (
            <Link href={`/tasks/${task.id}`} className="flex-1">
              <Button variant="ghost" className="w-full">
                Ver Detalhes
              </Button>
            </Link>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
