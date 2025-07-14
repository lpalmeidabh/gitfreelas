'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Play,
  Pause,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Shield,
  Users,
  Database,
  FileText,
  Download,
  Trash2,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useGitFreelasRead } from '@/hooks/web3/useContractRead'

export function AdminControls() {
  const { isContractConfigured, contractAddress } = useGitFreelasRead()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [emergencyReason, setEmergencyReason] = useState('')
  const [batchTaskIds, setBatchTaskIds] = useState('')

  // Estados simulados
  const [contractPaused, setContractPaused] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [autoProcessing, setAutoProcessing] = useState(true)

  const handleAction = async (action: string, callback?: () => void) => {
    setIsLoading(action)

    // Simular chamada para o contrato/API
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (callback) callback()
    toast.success(`${action} executado com sucesso!`)
    setIsLoading(null)
  }

  const simulateContractPause = () => {
    setContractPaused(!contractPaused)
    toast.success(contractPaused ? 'Contrato despausado' : 'Contrato pausado')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controles de Emergência */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Controles de Emergência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ Atenção:</strong> Estas funções afetam toda a
              plataforma. Use apenas em situações de emergência.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Pausar Contrato</div>
                <div className="text-sm text-muted-foreground">
                  Bloqueia todas as operações do contrato
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={contractPaused ? 'destructive' : 'secondary'}>
                  {contractPaused ? 'Pausado' : 'Ativo'}
                </Badge>
                <Button
                  size="sm"
                  variant={contractPaused ? 'default' : 'destructive'}
                  onClick={simulateContractPause}
                  disabled={!isContractConfigured}
                >
                  {contractPaused ? (
                    <>
                      <Play className="h-3 w-3 mr-2" />
                      Despausar
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3 mr-2" />
                      Pausar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="emergency-reason">Motivo da Emergência</Label>
              <Textarea
                id="emergency-reason"
                placeholder="Descreva o motivo da ação de emergência..."
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                rows={3}
              />
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleAction('emergency-stop')}
                disabled={
                  !emergencyReason.trim() || isLoading === 'emergency-stop'
                }
              >
                {isLoading === 'emergency-stop' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Parada de Emergência
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestão Financeira */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <DollarSign className="h-5 w-5" />
            Gestão Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium mb-2">
              Fees Disponíveis para Retirada
            </div>
            <div className="text-2xl font-bold text-green-600">0.254 ETH</div>
            <div className="text-xs text-muted-foreground">≈ $485.30 USD</div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="withdraw-amount">Valor para Retirada (ETH)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              step="0.001"
              placeholder="0.000"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() =>
                handleAction('withdraw-fees', () => setWithdrawAmount(''))
              }
              disabled={!withdrawAmount || isLoading === 'withdraw-fees'}
            >
              {isLoading === 'withdraw-fees' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Retirar Fees da Plataforma
            </Button>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Processado (Mês)</span>
              <span className="font-medium">2.45 ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fees Coletados (Mês)</span>
              <span className="font-medium">0.074 ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Última Retirada</span>
              <span className="font-medium">5 dias atrás</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processamento em Lote */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Processamento em Lote
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="batch-tasks">
              IDs das Tasks (separados por vírgula)
            </Label>
            <Textarea
              id="batch-tasks"
              placeholder="task-123, task-456, task-789..."
              value={batchTaskIds}
              onChange={(e) => setBatchTaskIds(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('process-expired')}
              disabled={isLoading === 'process-expired'}
            >
              {isLoading === 'process-expired' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              Processar Tasks Expiradas
            </Button>

            <Button
              variant="outline"
              onClick={() => handleAction('batch-update')}
              disabled={!batchTaskIds.trim() || isLoading === 'batch-update'}
            >
              {isLoading === 'batch-update' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar Status em Lote
            </Button>

            <Button
              variant="outline"
              onClick={() => handleAction('cleanup-expired')}
              disabled={isLoading === 'cleanup-expired'}
            >
              {isLoading === 'cleanup-expired' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Limpar Tasks Antigas
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <strong>Dica:</strong> O processamento em lote é mais eficiente para
            múltiplas operações simultâneas.
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Modo Manutenção</div>
                <div className="text-sm text-muted-foreground">
                  Desabilita criação de novas tasks
                </div>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Auto-processamento</div>
                <div className="text-sm text-muted-foreground">
                  Processa tasks expiradas automaticamente
                </div>
              </div>
              <Switch
                checked={autoProcessing}
                onCheckedChange={setAutoProcessing}
              />
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório Mensal
            </Button>

            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Backup do Banco de Dados
            </Button>

            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Administradores
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status das Operações */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Status das Operações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                action: 'Processamento de tasks expiradas',
                status: 'success',
                time: '2 minutos atrás',
                details: '3 tasks processadas, 2 reembolsos enviados',
              },
              {
                action: 'Retirada de fees da plataforma',
                status: 'success',
                time: '1 hora atrás',
                details: '0.05 ETH transferidos para carteira admin',
              },
              {
                action: 'Backup automático do sistema',
                status: 'success',
                time: '6 horas atrás',
                details: 'Backup completo salvo no storage',
              },
              {
                action: 'Verificação de integridade',
                status: 'warning',
                time: '12 horas atrás',
                details: '1 discrepância encontrada e corrigida',
              },
              {
                action: 'Atualização de configurações',
                status: 'success',
                time: '1 dia atrás',
                details: 'Período de overdue ajustado para 3 dias',
              },
            ].map((operation, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    operation.status === 'success'
                      ? 'bg-green-500'
                      : operation.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />

                <div className="flex-1">
                  <div className="font-medium text-sm">{operation.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {operation.details}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {operation.time}
                </div>

                <Badge
                  variant={
                    operation.status === 'success'
                      ? 'secondary'
                      : operation.status === 'warning'
                      ? 'outline'
                      : 'destructive'
                  }
                >
                  {operation.status === 'success'
                    ? 'Sucesso'
                    : operation.status === 'warning'
                    ? 'Atenção'
                    : 'Erro'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
