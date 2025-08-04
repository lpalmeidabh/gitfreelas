'use client'

import { DeveloperProfileCard } from '@/components/developer-profile-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatDateTimeDisplay,
  getDaysUntilDate,
  isDateOverdue,
  isDateUrgent,
} from '@/lib/date-utils'
import type { TaskWithRelations } from '@/types'
import { AlertTriangle, Calendar, CheckCircle, Clock, User } from 'lucide-react'
import { TaskActions } from './task-actions'
import { TaskValueInfo } from './task-value-info'
import { TransactionHistory } from './transaction-history'
import { SensitiveInfoSection } from './sensitive-info-section'

interface TaskInfoProps {
  task: TaskWithRelations
  currentUserId?: string
  searchParams?: {
    action?: string
  }
}

export function TaskInfo({ task, currentUserId, searchParams }: TaskInfoProps) {
  const isOverdue = isDateOverdue(task.deadline)
  const daysUntilDeadline = getDaysUntilDate(task.deadline) || 0
  const isUrgent = isDateUrgent(task.deadline)

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
    <>
      {/* Card Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className="h-5 w-5" />
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                {isOverdue && (
                  <Badge variant="destructive">
                    Vencida há {Math.abs(daysUntilDeadline)} dias
                  </Badge>
                )}
                {!isOverdue && isUrgent && (
                  <Badge variant="outline" className="border-yellow-500">
                    {daysUntilDeadline} dias restantes
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {task.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {parseFloat(task.valueInWei) / 1e18} ETH
              </div>
              <div className="text-sm text-muted-foreground">
                Valor da tarefa
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Requisitos */}
          {task.requirements && (
            <div>
              <h4 className="font-medium mb-2">Requisitos Técnicos</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {task.requirements}
              </p>
            </div>
          )}

          {/* Links e Anexos - Com controle de acesso */}
          <SensitiveInfoSection task={task} currentUserId={currentUserId} />

          {/* Deadline e configurações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Prazo de Entrega</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTimeDisplay(task.deadline)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Tempo Extra</p>
                <span className="text-sm text-muted-foreground">
                  {task.allowOverdue ? (
                    <span className="text-blue-600">
                      Permite 3 dias extras com desconto
                    </span>
                  ) : (
                    'Não permite extensão'
                  )}
                </span>
              </div>
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
        {/* Card Pessoas - USANDO DeveloperProfileCard */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Pessoas Envolvidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cliente */}
            <div>
              <h4 className="font-medium mb-3">Cliente</h4>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={task.creator.image || ''} />
                  <AvatarFallback>
                    {task.creator.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{task.creator.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.creator.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Desenvolvedor - USANDO DeveloperProfileCard */}
            {task.taskDeveloper && (
              <div>
                <h4 className="font-medium mb-3">Desenvolvedor</h4>
                <DeveloperProfileCard
                  developer={task.taskDeveloper.developer}
                  walletAddress={task.taskDeveloper.walletAddress}
                  appliedAt={task.taskDeveloper.appliedAt}
                  showBadges={false}
                  className="bg-muted/30"
                />
              </div>
            )}

            {/* Estado da aplicação */}
            {!task.taskDeveloper && task.status === 'OPEN' && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">
                  Aguardando aplicações de desenvolvedores
                </p>
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
