import { getTaskById } from '@/actions/tasks'
import { ApplyTaskButton } from '@/components/tasks/apply-task-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { TASK_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/types'
import { weiToEther } from '@/lib/web3/config'
import {
  ArrowLeft,
  Calendar,
  Wallet,
  User,
  Clock,
  GitBranch,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Shield,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TaskDetailsPageProps {
  params: {
    id: string
  }
  searchParams: {
    action?: string
  }
}

export async function generateMetadata({ params }: TaskDetailsPageProps) {
  const task = await getTaskById(params.id)

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
  // Verificar autenticação
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/')
  }

  // Buscar dados da tarefa
  const task = await getTaskById(params.id)

  if (!task) {
    notFound()
  }

  const currentUserId = session.user.id
  const isOwner = currentUserId === task.creatorId
  const isDeveloper = currentUserId === task.taskDeveloper?.developerId
  const canApply = task.status === 'OPEN' && !isOwner && !task.taskDeveloper

  // Calcular informações
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/tasks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título e Status */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className={cn('text-sm', statusInfo.color)}
                >
                  {statusInfo.label}
                </Badge>
                {isUrgent && <Badge variant="destructive">Urgente</Badge>}
                {isOverdue && <Badge variant="destructive">Vencida</Badge>}
                {task.allowOverdue && (
                  <Badge variant="secondary">+3 dias extras</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-3">{task.title}</h1>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Criada{' '}
                  {formatDistanceToNow(new Date(task.createdAt), {
                    locale: ptBR,
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Atualizada{' '}
                  {formatDistanceToNow(new Date(task.updatedAt), {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>

            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição da Tarefa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              </CardContent>
            </Card>

            {/* Requisitos */}
            {task.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos Técnicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {task.requirements}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Repositório */}
            {task.repository && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Repositório
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">
                        {task.repository.repositoryName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criado{' '}
                        {formatDistanceToNow(
                          new Date(task.repository.createdAt),
                          { locale: ptBR },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={task.repository.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir GitHub
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico de Transações */}
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
                    {task.transactions.map((tx) => {
                      const typeInfo = TRANSACTION_TYPE_LABELS[tx.type]
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full',
                                typeInfo.color.replace('text-', 'bg-'),
                              )}
                            />
                            <div>
                              <p className="font-medium">{typeInfo.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(tx.createdAt), {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {weiToEther(tx.valueInWei)} ETH
                            </p>
                            {tx.txHash && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-auto p-0 text-xs"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Valor e Ações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Valor da Tarefa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{formattedValue} ETH</div>
                  <div className="text-sm text-muted-foreground">
                    ~$XXX USD {/* TODO: Integrar API de preços */}
                  </div>
                </div>

                <Separator />

                {/* Ações baseadas no papel do usuário */}
                {canApply && (
                  <ApplyTaskButton
                    task={task}
                    currentUserId={currentUserId}
                    className="w-full"
                  />
                )}

                {isOwner && task.status === 'APPLIED' && task.taskDeveloper && (
                  <div className="space-y-2">
                    <Button className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aceitar Desenvolvedor
                    </Button>
                    <Button variant="outline" className="w-full">
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                )}

                {isOwner && task.status === 'PENDING_APPROVAL' && (
                  <div className="space-y-2">
                    <Button className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar Entrega
                    </Button>
                    <Button variant="outline" className="w-full">
                      <XCircle className="h-4 w-4 mr-2" />
                      Solicitar Correções
                    </Button>
                  </div>
                )}

                {isDeveloper && task.status === 'IN_PROGRESS' && (
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submeter para Aprovação
                  </Button>
                )}

                {isDeveloper && task.status === 'APPLIED' && (
                  <Button variant="outline" className="w-full">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Aplicação
                  </Button>
                )}

                {!canApply && !isOwner && !isDeveloper && (
                  <div className="text-center text-sm text-muted-foreground">
                    {task.status === 'COMPLETED' && 'Tarefa concluída'}
                    {task.status === 'CANCELLED' && 'Tarefa cancelada'}
                    {task.status === 'OVERDUE' && 'Tarefa vencida'}
                    {task.taskDeveloper &&
                      task.status !== 'COMPLETED' &&
                      task.status !== 'CANCELLED' &&
                      task.status !== 'OVERDUE' &&
                      'Tarefa já tem desenvolvedor'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prazo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Prazo de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="font-medium">
                      {new Date(task.deadline).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div
                      className={cn(
                        'text-sm',
                        isUrgent
                          ? 'text-red-600'
                          : isOverdue
                          ? 'text-red-600'
                          : 'text-muted-foreground',
                      )}
                    >
                      {formatDeadline(task.deadline)}
                    </div>
                  </div>

                  {task.allowOverdue && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Prazo Flexível
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        3 dias extras permitidos com desconto de 10% por dia
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={task.creator.image} />
                    <AvatarFallback>
                      {task.creator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{task.creator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.creator.email}
                    </p>
                  </div>
                  {isOwner && <Badge variant="secondary">Você</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Desenvolvedor (se aplicado) */}
            {task.taskDeveloper && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Desenvolvedor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={task.taskDeveloper.developer.image} />
                        <AvatarFallback>
                          {task.taskDeveloper.developer.name
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {task.taskDeveloper.developer.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.taskDeveloper.developer.email}
                        </p>
                      </div>
                      {isDeveloper && <Badge variant="secondary">Você</Badge>}
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        Aplicou-se{' '}
                        {formatDistanceToNow(
                          new Date(task.taskDeveloper.appliedAt),
                          { locale: ptBR },
                        )}
                      </p>
                      {task.taskDeveloper.acceptedAt && (
                        <p>
                          Aceito{' '}
                          {formatDistanceToNow(
                            new Date(task.taskDeveloper.acceptedAt),
                            { locale: ptBR },
                          )}
                        </p>
                      )}
                    </div>

                    <div className="p-2 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">
                        Carteira:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono">
                          {task.taskDeveloper.walletAddress.slice(0, 6)}...
                          {task.taskDeveloper.walletAddress.slice(-4)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Valores protegidos por smart contract</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Pagamento automático após aprovação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Repositório criado automaticamente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Histórico transparente na blockchain</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
