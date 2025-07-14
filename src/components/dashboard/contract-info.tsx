'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Database,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Code,
  Activity,
  FileText,
} from 'lucide-react'
import { useGitFreelasRead } from '@/hooks/web3/useContractRead'
import { APP_CONFIG } from '@/lib/web3/config'
import { toast } from 'sonner'
import { useChainId } from 'wagmi'

export function ContractInfo() {
  const {
    platformFee,
    minimumTaskValue,
    minimumTaskValueEth,
    overduePeriod,
    taskCount,
    isContractConfigured,
    contractAddress,
  } = useGitFreelasRead()

  const chainId = useChainId()
  const chain = APP_CONFIG.defaultChain

  // Dados simulados para demonstração
  const contractMetrics = {
    deployBlock: 4892341,
    deployDate: '2024-12-15',
    version: 'v1.0.0',
    gasUsedDeploy: 2847592,
    bytecodeSize: '24.3 KB',
    totalTransactions: 1247,
    avgGasPerTx: 125000,
    uptime: 99.97,
    lastUpgrade: 'Nunca',
    securityAudit: 'Pendente',
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copiado para a área de transferência`)
    } catch (error) {
      toast.error(`Erro ao copiar ${label}`)
    }
  }

  const openInExplorer = (address: string) => {
    const explorerUrl = chain.blockExplorers?.default?.url
    if (explorerUrl) {
      window.open(`${explorerUrl}/address/${address}`, '_blank')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Informações do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Endereço do Contrato
              </label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                  {contractAddress}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(contractAddress, 'Endereço')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openInExplorer(contractAddress)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Rede
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {chain.name}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Chain ID
                </label>
                <div className="mt-1 font-mono text-sm">{chainId}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Versão
                </label>
                <div className="mt-1 font-semibold">
                  {contractMetrics.version}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={isContractConfigured ? 'secondary' : 'destructive'}
                  >
                    {isContractConfigured ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Taxa da Plataforma</div>
                <div className="text-sm text-muted-foreground">
                  Porcentagem cobrada em cada transação
                </div>
              </div>
              <Badge variant="outline" className="text-lg font-bold">
                {platformFee}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Valor Mínimo</div>
                <div className="text-sm text-muted-foreground">
                  Menor valor permitido para tasks
                </div>
              </div>
              <Badge variant="outline" className="text-lg font-bold">
                {minimumTaskValueEth} ETH
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Período Overdue</div>
                <div className="text-sm text-muted-foreground">
                  Dias extras permitidos com penalidade
                </div>
              </div>
              <Badge variant="outline" className="text-lg font-bold">
                {overduePeriod} dias
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Total de Tasks</div>
                <div className="text-sm text-muted-foreground">
                  Número total registrado no contrato
                </div>
              </div>
              <Badge variant="outline" className="text-lg font-bold">
                {taskCount}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            Métricas Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Block de Deploy
              </label>
              <div className="mt-1 font-mono text-sm">
                #{contractMetrics.deployBlock.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Data de Deploy
              </label>
              <div className="mt-1 text-sm">{contractMetrics.deployDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Gas Usado (Deploy)
              </label>
              <div className="mt-1 font-mono text-sm">
                {contractMetrics.gasUsedDeploy.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tamanho do Bytecode
              </label>
              <div className="mt-1 text-sm">{contractMetrics.bytecodeSize}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Total de Transações
              </label>
              <div className="mt-1 font-semibold">
                {contractMetrics.totalTransactions.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Gas Médio/Tx
              </label>
              <div className="mt-1 font-mono text-sm">
                {contractMetrics.avgGasPerTx.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uptime do Contrato</span>
              <span className="text-lg font-bold text-green-600">
                {contractMetrics.uptime}%
              </span>
            </div>
            <Progress value={contractMetrics.uptime} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Status e Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Status e Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Contrato Verificado</span>
              </div>
              <Badge variant="secondary" className="text-green-600">
                Etherscan
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Função Pause</span>
              </div>
              <Badge variant="secondary" className="text-blue-600">
                Disponível
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Auditoria de Segurança</span>
              </div>
              <Badge variant="outline" className="text-yellow-600">
                {contractMetrics.securityAudit}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Último Upgrade</span>
              </div>
              <Badge variant="outline" className="text-gray-600">
                {contractMetrics.lastUpgrade}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <FileText className="h-3 w-3 mr-2" />
                Ver ABI
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <ExternalLink className="h-3 w-3 mr-2" />
                Etherscan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funções Disponíveis */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Funções do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'createTask',
                type: 'write',
                description: 'Criar nova task com depósito',
                gasEstimate: '~180k',
              },
              {
                name: 'applyToTask',
                type: 'write',
                description: 'Aplicar como desenvolvedor',
                gasEstimate: '~85k',
              },
              {
                name: 'completeTask',
                type: 'write',
                description: 'Marcar task como concluída',
                gasEstimate: '~120k',
              },
              {
                name: 'cancelTask',
                type: 'write',
                description: 'Cancelar task e reembolsar',
                gasEstimate: '~95k',
              },
              {
                name: 'getTaskByTaskId',
                type: 'read',
                description: 'Buscar dados de uma task',
                gasEstimate: 'Free',
              },
              {
                name: 'getTaskCount',
                type: 'read',
                description: 'Número total de tasks',
                gasEstimate: 'Free',
              },
              {
                name: 'getPlatformStats',
                type: 'read',
                description: 'Estatísticas da plataforma',
                gasEstimate: 'Free',
              },
              {
                name: 'withdrawPlatformFees',
                type: 'write',
                description: 'Retirar fees (admin only)',
                gasEstimate: '~65k',
              },
            ].map((func, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xs font-mono font-bold">
                    {func.name}
                  </code>
                  <Badge
                    variant={func.type === 'write' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {func.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {func.description}
                </div>
                <div className="text-xs font-mono text-orange-600">
                  Gas: {func.gasEstimate}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
