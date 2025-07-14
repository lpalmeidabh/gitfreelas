import { getTaskById } from '@/actions/tasks'
import { ApplyTaskButton } from '@/components/tasks/apply-task-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { weiToEther } from '@/lib/web3/config'
import { TASK_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileEdit,
  GitBranch,
  Settings,
  Wallet,
  XCircle,
} from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface TaskDetailsPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    action?: string
  }>
}

export async function generateMetadata({ params }: TaskDetailsPageProps) {
  const resolvedParams = await params
  const task = await getTaskById(resolvedParams.id)

  if (!task) {
    return {
      title: 'Tarefa não encontrada | GitFreelas',
    }
  }

  return {
    title: `${task.title} | GitFreelas`,
    description: task.description.slice(0, 160),
  }
}

export default async function TaskDetailsPage({
  params,
  searchParams,
}: TaskDetailsPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/')
  }

  const task = await getTaskById(resolvedParams.id)

  if (!task) {
    notFound()
  }

  const currentUserId = session.user.id
  const isOwner = currentUserId === task.creatorId
  const isDeveloper =
    currentUserId === task.taskDeveloper?.developerId &&
    task.status === 'IN_PROGRESS'
  const hasApplied =
    currentUserId === task.taskDeveloper?.developerId &&
    task.status === 'APPLIED'
  const canApply = task.status === 'OPEN' && !isOwner && !task.taskDeveloper

  const valueInEth = weiToEther(task.valueInWei)
  const formattedValue = parseFloat(valueInEth).toFixed(4)
  const statusInfo = TASK_STATUS_LABELS[task.status]

  const daysUntilDeadline = Math.ceil(
    (new Date(task.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  )

  const isUrgent = daysUntilDeadline <= 2 && daysUntilDeadline > 0
  const isOverdue = daysUntilDeadline < 0

  const formatDeadline = (deadline: Date) => {
    return formatDistanceToNow(new Date(deadline), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/tasks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={cn(statusInfo.color, 'border-current')}
                      >
                        {statusInfo.label}
                      </Badge>
                      {isUrgent && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Urgente
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Vencida
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">
                      {task.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {task.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5" />
                  Detalhes da Tarefa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Requisitos</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {task.requirements}
                    </p>
                  </div>
                )}

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

            {task.transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Histórico de Transações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.transactions.map((transaction) => {
                      const typeInfo = TRANSACTION_TYPE_LABELS[transaction.type]
                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">
                                {weiToEther(transaction.valueInWei)} ETH
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(transaction.createdAt),
                                  {
                                    addSuffix: true,
                                    locale: ptBR,
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          {transaction.txHash && (
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Valor da Tarefa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formattedValue} ETH
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ≈ ${(parseFloat(formattedValue) * 2000).toFixed(2)} USD
                  </p>
                </div>

                {canApply && (
                  <div className="pt-2">
                    <ApplyTaskButton
                      task={task}
                      currentUserId={currentUserId}
                      className="w-full"
                    />
                  </div>
                )}

                {isOwner && (
                  <div className="pt-2 space-y-2">
                    <Badge
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      Sua Tarefa
                    </Badge>
                    {task.status === 'APPLIED' && (
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Revisar Aplicações
                      </Button>
                    )}
                  </div>
                )}

                {isDeveloper && (
                  <div className="pt-2 space-y-2">
                    <Badge
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      Você é o Desenvolvedor
                    </Badge>
                    <Button className="w-full">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Submeter Trabalho
                    </Button>
                  </div>
                )}

                {hasApplied && (
                  <div className="pt-2">
                    <Badge variant="outline" className="w-full justify-center">
                      Aplicação Enviada - Aguardando Aprovação
                    </Badge>
                  </div>
                )}

                {/* {!canApply && !isOwner && !isDeveloper && (
                  <div className="pt-2">
                    <Badge variant="outline" className="w-full justify-center">
                      {task.taskDeveloper
                        ? 'Já tem desenvolvedor'
                        : 'Não disponível'}
                    </Badge>
                  </div>
                )} */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Prazo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={cn(
                      'text-2xl font-bold mb-2',
                      isOverdue
                        ? 'text-red-600'
                        : isUrgent
                        ? 'text-orange-600'
                        : 'text-blue-600',
                    )}
                  >
                    {Math.abs(daysUntilDeadline)} dias
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isOverdue ? 'Venceu' : 'Restante'}:{' '}
                    {formatDeadline(task.deadline)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Criada em{' '}
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {task.repository && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Repositório
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {task.repository.repositoryName}
                    </p>
                    {task.repository.repositoryUrl && (
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver no GitHub
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {resolvedSearchParams.action && (
          <div className="mt-8">
            {resolvedSearchParams.action === 'apply' && canApply && (
              <Card>
                <CardHeader>
                  <CardTitle>Aplicar para Tarefa</CardTitle>
                  <CardDescription>
                    Complete sua aplicação para esta tarefa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Formulário de aplicação em desenvolvimento...
                  </p>
                </CardContent>
              </Card>
            )}

            {resolvedSearchParams.action === 'review' &&
              isOwner &&
              task.taskDeveloper && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revisar Aplicação</CardTitle>
                    <CardDescription>
                      Aceite ou rejeite a aplicação do desenvolvedor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Interface de revisão em desenvolvimento...
                    </p>
                  </CardContent>
                </Card>
              )}

            {resolvedSearchParams.action === 'submit' && isDeveloper && (
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

            {resolvedSearchParams.action === 'approve' && isOwner && (
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
        )}
      </div>
    </div>
  )
}
