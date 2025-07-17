'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  FileText,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

interface EventLog {
  id: string
  timestamp: string
  type: 'task' | 'user' | 'system' | 'financial'
  event: string
  description: string
  status: 'success' | 'warning' | 'error' | 'info'
  txHash?: string
  userId?: string
  taskId?: string
  value?: string
  gasUsed?: number
}

export function EventLogs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [eventType, setEventType] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Dados simulados de eventos
  const mockEvents: EventLog[] = [
    {
      id: '1',
      timestamp: '2024-07-13T14:25:30Z',
      type: 'task',
      event: 'TaskCompleted',
      description: 'Task "API REST Node.js" foi concluída pelo desenvolvedor',
      status: 'success',
      txHash: '0x742d35cc123ef45e8c19000f207e6b23cc1c3a2a',
      userId: 'dev-456',
      taskId: 'task-123',
      value: '0.08 ETH',
      gasUsed: 127485,
    },
    {
      id: '2',
      timestamp: '2024-07-13T14:20:15Z',
      type: 'financial',
      event: 'PlatformFeeCollected',
      description: 'Taxa da plataforma coletada (3%)',
      status: 'success',
      txHash: '0x742d35cc123ef45e8c19000f207e6b23cc1c3a2b',
      value: '0.0024 ETH',
      gasUsed: 65200,
    },
    {
      id: '3',
      timestamp: '2024-07-13T14:15:45Z',
      type: 'task',
      event: 'DeveloperAccepted',
      description: 'Desenvolvedor se aplicou para task "Frontend React"',
      status: 'info',
      txHash: '0x742d35cc123ef45e8c19000f207e6b23cc1c3a2c',
      userId: 'dev-789',
      taskId: 'task-456',
      gasUsed: 85400,
    },
    {
      id: '4',
      timestamp: '2024-07-13T14:10:22Z',
      type: 'user',
      event: 'UserRegistered',
      description: 'Novo desenvolvedor se registrou na plataforma',
      status: 'success',
      userId: 'dev-101',
    },
    {
      id: '5',
      timestamp: '2024-07-13T14:05:10Z',
      type: 'task',
      event: 'TaskCreated',
      description: 'Nova task "Smart Contract Audit" foi criada',
      status: 'success',
      txHash: '0x742d35cc123ef45e8c19000f207e6b23cc1c3a2d',
      userId: 'client-555',
      taskId: 'task-789',
      value: '0.25 ETH',
      gasUsed: 165200,
    },
    {
      id: '6',
      timestamp: '2024-07-13T13:55:30Z',
      type: 'system',
      event: 'TaskExpired',
      description: 'Task "Mobile App Flutter" expirou automaticamente',
      status: 'warning',
      taskId: 'task-321',
    },
    {
      id: '7',
      timestamp: '2024-07-13T13:45:18Z',
      type: 'financial',
      event: 'RefundProcessed',
      description: 'Reembolso processado para cliente devido a expiração',
      status: 'info',
      txHash: '0x742d35cc123ef45e8c19000f207e6b23cc1c3a2e',
      userId: 'client-222',
      taskId: 'task-321',
      value: '0.12 ETH',
      gasUsed: 95600,
    },
    {
      id: '8',
      timestamp: '2024-07-13T13:30:45Z',
      type: 'system',
      event: 'ContractUpgraded',
      description: 'Contrato foi atualizado para versão v1.0.1',
      status: 'success',
      txHash: '0x742d35cc123ef45e8c19000f207e6b23cc1c3a2f',
    },
    {
      id: '9',
      timestamp: '2024-07-13T13:20:12Z',
      type: 'task',
      event: 'TaskCancelled',
      description: 'Task "Website WordPress" foi cancelada pelo cliente',
      status: 'warning',
      txHash: '0x742d35cc123ef45e8c19000f207e6b23cc1c3a30',
      userId: 'client-333',
      taskId: 'task-654',
      value: '0.06 ETH',
      gasUsed: 78500,
    },
    {
      id: '10',
      timestamp: '2024-07-13T13:10:55Z',
      type: 'system',
      event: 'SecurityAlert',
      description: 'Tentativa de acesso não autorizado detectada',
      status: 'error',
    },
  ]

  const getEventIcon = (type: string, status: string) => {
    if (status === 'error') return <XCircle className="h-4 w-4 text-red-500" />
    if (status === 'warning')
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />

    switch (type) {
      case 'task':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'user':
        return <Users className="h-4 w-4 text-green-500" />
      case 'financial':
        return <DollarSign className="h-4 w-4 text-purple-500" />
      case 'system':
        return <Activity className="h-4 w-4 text-orange-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'secondary',
      warning: 'outline',
      error: 'destructive',
      info: 'default',
    } as const

    const labels = {
      success: 'Sucesso',
      warning: 'Atenção',
      error: 'Erro',
      info: 'Info',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = eventType === 'all' || event.type === eventType
    const matchesStatus =
      statusFilter === 'all' || event.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 60) {
      return `${diffMins} min atrás`
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    toast.success('Logs atualizados!')
  }

  const handleExport = () => {
    toast.success('Exportação iniciada! Arquivo será baixado em breve.')
  }

  const openInExplorer = (txHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filtros e Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="user">Usuários</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ações</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex-1"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {mockEvents.filter((e) => e.status === 'success').length}
                </div>
                <div className="text-sm text-muted-foreground">Sucessos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {mockEvents.filter((e) => e.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Avisos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  {mockEvents.filter((e) => e.status === 'error').length}
                </div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{mockEvents.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Logs de Eventos
            </div>
            <Badge variant="outline">
              {filteredEvents.length} evento
              {filteredEvents.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou termos de pesquisa
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.type, event.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono font-bold">
                            {event.event}
                          </code>
                          {getStatusBadge(event.status)}
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatTimestamp(event.timestamp)}
                          </span>

                          {event.taskId && <span>Task: {event.taskId}</span>}

                          {event.userId && <span>User: {event.userId}</span>}

                          {event.value && (
                            <span className="font-medium text-green-600">
                              {event.value}
                            </span>
                          )}

                          {event.gasUsed && (
                            <span>Gas: {event.gasUsed.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      {event.txHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openInExplorer(event.txHash!)}
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="text-center text-sm text-muted-foreground">
        Mostrando {filteredEvents.length} de {mockEvents.length} eventos •
        Última atualização: {formatTimestamp(new Date().toISOString())}
      </div>
    </div>
  )
}
