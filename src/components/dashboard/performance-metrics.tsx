'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Target,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  Gauge,
  Wifi,
  Server,
} from 'lucide-react'

export function PerformanceMetrics() {
  // Dados simulados para demonstração
  const networkMetrics = {
    blockTime: 12.5,
    gasPrice: 15,
    networkLatency: 145,
    rpcUptime: 99.8,
    transactionPool: 2847,
    pendingTxs: 12,
  }

  const contractMetrics = {
    avgGasUsed: 125000,
    successRate: 98.7,
    avgExecutionTime: 2.3,
    totalCalls: 1247,
    failedCalls: 16,
    peakTPS: 12.5,
  }

  const platformMetrics = {
    responseTime: 89,
    dbQueries: 8542,
    cacheHitRate: 94.2,
    activeConnections: 156,
    errorRate: 0.3,
    uptime: 99.97,
  }

  const businessMetrics = {
    tasksPerDay: 23,
    avgTaskValue: 0.15,
    conversionRate: 67.8,
    userRetention: 89.5,
    revenueGrowth: 18.5,
    customerSat: 4.6,
  }

  return (
    <div className="space-y-6">
      {/* Network Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4 text-blue-600" />
              Performance da Rede
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Tempo de Block
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {networkMetrics.blockTime}s
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Normal
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Price</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {networkMetrics.gasPrice} gwei
                  </span>
                  <TrendingDown className="h-3 w-3 text-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Latência RPC
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {networkMetrics.networkLatency}ms
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Boa
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Uptime RPC</span>
                  <span className="font-bold text-green-600">
                    {networkMetrics.rpcUptime}%
                  </span>
                </div>
                <Progress value={networkMetrics.rpcUptime} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-purple-600" />
              Performance do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Médio</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {contractMetrics.avgGasUsed.toLocaleString()}
                  </span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Taxa de Sucesso
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {contractMetrics.successRate}%
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Excelente
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Tempo Execução
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {contractMetrics.avgExecutionTime}s
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Rápido
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs">
                  <span>Chamadas: {contractMetrics.totalCalls}</span>
                  <span>Falhas: {contractMetrics.failedCalls}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-orange-600" />
              Performance da API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Tempo Resposta
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {platformMetrics.responseTime}ms
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Ótimo
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Cache Hit Rate
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {platformMetrics.cacheHitRate}%
                  </span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Taxa de Erro
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {platformMetrics.errorRate}%
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Baixa
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Uptime API</span>
                  <span className="font-bold text-green-600">
                    {platformMetrics.uptime}%
                  </span>
                </div>
                <Progress value={platformMetrics.uptime} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Performance em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Métricas em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Simulação de gráfico com barras de progresso */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">CPU do Servidor</span>
                  <span className="text-sm text-muted-foreground">32%</span>
                </div>
                <Progress value={32} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Memória RAM</span>
                  <span className="text-sm text-muted-foreground">67%</span>
                </div>
                <Progress value={67} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Conexões Ativas</span>
                  <span className="text-sm text-muted-foreground">156/200</span>
                </div>
                <Progress value={78} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Throughput</span>
                  <span className="text-sm text-muted-foreground">
                    8.5 req/s
                  </span>
                </div>
                <Progress value={85} className="h-3" />
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {platformMetrics.dbQueries.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Queries/hora
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {platformMetrics.activeConnections}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Conexões
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              KPIs de Negócio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {businessMetrics.tasksPerDay}
                </div>
                <div className="text-sm text-muted-foreground">Tasks/dia</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+15%</span>
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {businessMetrics.avgTaskValue} ETH
                </div>
                <div className="text-sm text-muted-foreground">Valor médio</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">-3%</span>
                </div>
              </div>

              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {businessMetrics.conversionRate}%
                </div>
                <div className="text-sm text-muted-foreground">Conversão</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+8%</span>
                </div>
              </div>

              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {businessMetrics.userRetention}%
                </div>
                <div className="text-sm text-muted-foreground">Retenção</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+2%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Crescimento da Receita</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">
                    +{businessMetrics.revenueGrowth}%
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Satisfação do Cliente</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {businessMetrics.customerSat}/5.0
                  </span>
                  <Badge variant="secondary">Excelente</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benchmarks e Comparações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-purple-600" />
            Benchmarks e Comparações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">vs. Mês Anterior</h4>
              <div className="space-y-3">
                {[
                  {
                    metric: 'Volume de transações',
                    value: '+23%',
                    trend: 'up',
                  },
                  { metric: 'Tempo de resposta', value: '-12%', trend: 'up' },
                  { metric: 'Taxa de erro', value: '-45%', trend: 'up' },
                  {
                    metric: 'Satisfação do usuário',
                    value: '+8%',
                    trend: 'up',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-muted-foreground">
                      {item.metric}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs font-medium ${
                          item.trend === 'up'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {item.value}
                      </span>
                      {item.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm">Metas vs. Realizado</h4>
              <div className="space-y-3">
                {[
                  {
                    metric: 'Tasks criadas',
                    target: 600,
                    actual: 687,
                    percentage: 114,
                  },
                  {
                    metric: 'Receita mensal',
                    target: 0.2,
                    actual: 0.254,
                    percentage: 127,
                  },
                  {
                    metric: 'Novos usuários',
                    target: 20,
                    actual: 23,
                    percentage: 115,
                  },
                  {
                    metric: 'Uptime',
                    target: 99.5,
                    actual: 99.97,
                    percentage: 100,
                  },
                ].map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {item.metric}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          item.percentage >= 100
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(item.percentage, 100)}
                      className="h-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm">Alertas de Performance</h4>
              <div className="space-y-3">
                {[
                  {
                    type: 'success',
                    message: 'Todas as métricas estão normais',
                    time: 'Atualizado agora',
                  },
                  {
                    type: 'warning',
                    message: 'Latência RPC acima da média',
                    time: '5 min atrás',
                  },
                  {
                    type: 'info',
                    message: 'Backup automático concluído',
                    time: '1 hora atrás',
                  },
                ].map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1 ${
                        alert.type === 'success'
                          ? 'bg-green-500'
                          : alert.type === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-xs font-medium">{alert.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {alert.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Última atualização: há 30 segundos
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="h-3 w-3 mr-2" />
            Atualizar Métricas
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-3 w-3 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>
    </div>
  )
}
