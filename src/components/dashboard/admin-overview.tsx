'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Activity,
  Calendar,
  Zap,
} from 'lucide-react'
import { useGitFreelasRead } from '@/hooks/web3/useContractRead'

export function AdminOverview() {
  const { platformFee, taskCount, isContractConfigured, contractAddress } =
    useGitFreelasRead()

  // Dados simulados para demonstração (em produção viriam do contrato/API)
  const mockData = {
    totalValueProcessed: 8.45,
    completedTasks: 156,
    activeTasks: 12,
    cancelledTasks: 8,
    activeUsers: 89,
    newUsersThisMonth: 23,
    avgTaskValue: 0.15,
    avgCompletionTime: 5.2,
    successRate: 94.2,
    platformRevenue: 0.254,
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Estatísticas Principais */}
      <div className="lg:col-span-2 space-y-6">
        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mockData.totalValueProcessed} ETH
                </div>
                <div className="text-sm text-muted-foreground">
                  Volume Total
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+18%</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {mockData.platformRevenue} ETH
                </div>
                <div className="text-sm text-muted-foreground">
                  Receita (3%)
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+15%</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {mockData.avgTaskValue} ETH
                </div>
                <div className="text-sm text-muted-foreground">Valor Médio</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">-3%</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {mockData.avgCompletionTime}d
                </div>
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status das Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Status das Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Concluídas
                  </span>
                  <Badge variant="secondary">{mockData.completedTasks}</Badge>
                </div>
                <Progress value={85} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  85% do total de tasks
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Em Andamento
                  </span>
                  <Badge variant="secondary">{mockData.activeTasks}</Badge>
                </div>
                <Progress value={12} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  12% do total de tasks
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Canceladas
                  </span>
                  <Badge variant="secondary">{mockData.cancelledTasks}</Badge>
                </div>
                <Progress value={3} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  3% do total de tasks
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Taxa de Sucesso Geral
                </span>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-green-600">
                    {mockData.successRate}%
                  </div>
                  <Badge variant="secondary" className="text-green-600">
                    Excelente
                  </Badge>
                </div>
              </div>
              <Progress value={mockData.successRate} className="h-3 mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  icon: CheckCircle,
                  color: 'text-green-500',
                  title: 'Task "API REST Node.js" foi concluída',
                  time: '2 minutos atrás',
                  value: '0.08 ETH',
                },
                {
                  icon: Users,
                  color: 'text-blue-500',
                  title: 'Novo desenvolvedor se registrou',
                  time: '15 minutos atrás',
                  value: null,
                },
                {
                  icon: DollarSign,
                  color: 'text-green-500',
                  title: 'Task "Frontend React" foi criada',
                  time: '32 minutos atrás',
                  value: '0.12 ETH',
                },
                {
                  icon: Clock,
                  color: 'text-orange-500',
                  title: 'Task "Smart Contract Audit" aplicada',
                  time: '1 hora atrás',
                  value: '0.25 ETH',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                  {activity.value && (
                    <Badge variant="outline" className="text-green-600">
                      {activity.value}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar com Métricas */}
      <div className="space-y-6">
        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Contrato Principal</span>
              <Badge
                variant={isContractConfigured ? 'secondary' : 'destructive'}
              >
                {isContractConfigured ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Rede Sepolia</span>
              <Badge variant="secondary">Ativa</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">API Backend</span>
              <Badge variant="secondary">Operacional</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">GitHub Integration</span>
              <Badge variant="secondary">Conectado</Badge>
            </div>

            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground mb-2">
                Uptime: 99.8%
              </div>
              <Progress value={99.8} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{mockData.activeUsers}</div>
              <div className="text-sm text-muted-foreground">
                Usuários ativos
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Novos este mês</span>
                <span className="font-medium">
                  +{mockData.newUsersThisMonth}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Desenvolvedores</span>
                <span className="font-medium">67</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Clientes</span>
                <span className="font-medium">22</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Crescimento mensal</span>
              </div>
              <div className="text-lg font-bold text-green-600">+35%</div>
            </div>
          </CardContent>
        </Card>

        {/* Próximas Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🎯 Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>2 tasks expirando em 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Processar 5 withdrawals pendentes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Backup do banco de dados</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
