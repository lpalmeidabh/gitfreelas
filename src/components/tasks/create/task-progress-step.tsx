'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Link,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface TaskProgressStepProps {
  currentStep: 'database' | 'blockchain' | 'database_tx' | 'success' // ← Adicionar 'success'
  isCreating: boolean
  createSuccess: boolean
  createTx?: string
  createError?: Error | null
}
export function TaskProgressStep({
  currentStep,
  isCreating,
  createSuccess,
  createTx,
  createError,
}: TaskProgressStepProps) {
  const router = useRouter()

  // Detectar quando o processo está completo
  const isCompleted =
    currentStep === 'success' ||
    (createSuccess && createTx && currentStep === 'database_tx' && !isCreating)

  // Redirecionar quando completado
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        toast.success('Tarefa criada com sucesso!')
        router.push('/tasks/my-tasks')
      }, 2000) // 2 segundos para mostrar o sucesso

      return () => clearTimeout(timer)
    }
  }, [isCompleted, router])

  // Helper functions
  const getStepStatus = (step: 'database' | 'blockchain' | 'database_tx') => {
    const steps = ['database', 'blockchain', 'database_tx']
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)

    // Se completou tudo, marcar todos como completed
    if (isCompleted) return 'completed'

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  const getProgressPercentage = () => {
    if (isCompleted) return 100

    switch (currentStep) {
      case 'database':
        return 33
      case 'blockchain':
        return 66
      case 'database_tx':
        return 90 // 90% quando está atualizando, 100% quando completo
      default:
        return 0
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
            {isCompleted ? 'Tarefa Criada com Sucesso!' : 'Criando Tarefa...'}
          </CardTitle>
          <CardDescription>
            {isCompleted
              ? 'Sua tarefa foi registrada na blockchain e está disponível para desenvolvedores'
              : 'Processando sua transação em etapas'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {createError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao criar tarefa: {createError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1: Database */}
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                getStepStatus('database') === 'current'
                  ? 'bg-blue-50 border-blue-200'
                  : getStepStatus('database') === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-muted/50',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  getStepStatus('database') === 'current'
                    ? 'bg-blue-600 text-white'
                    : getStepStatus('database') === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {getStepStatus('database') === 'current' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : getStepStatus('database') === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Registrando no Banco</p>
                <p className="text-xs text-muted-foreground">
                  {getStepStatus('database') === 'current'
                    ? 'Salvando dados da tarefa...'
                    : getStepStatus('database') === 'completed'
                    ? 'Tarefa registrada com sucesso'
                    : 'Preparando para salvar dados'}
                </p>
              </div>
            </div>

            {/* Step 2: Blockchain */}
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                getStepStatus('blockchain') === 'current'
                  ? 'bg-blue-50 border-blue-200'
                  : getStepStatus('blockchain') === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-muted/50',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  getStepStatus('blockchain') === 'current'
                    ? 'bg-blue-600 text-white'
                    : getStepStatus('blockchain') === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {getStepStatus('blockchain') === 'current' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : getStepStatus('blockchain') === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Link className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Enviando para Blockchain</p>
                <p className="text-xs text-muted-foreground">
                  {getStepStatus('blockchain') === 'current'
                    ? isCreating
                      ? 'Confirmando transação...'
                      : 'Enviando transação...'
                    : getStepStatus('blockchain') === 'completed'
                    ? 'Transação confirmada na blockchain'
                    : 'Aguardando etapa anterior'}
                </p>
              </div>
            </div>

            {/* Step 3: Database Update */}
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                getStepStatus('database_tx') === 'current'
                  ? 'bg-blue-50 border-blue-200'
                  : getStepStatus('database_tx') === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-muted/50',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  getStepStatus('database_tx') === 'current'
                    ? 'bg-blue-600 text-white'
                    : getStepStatus('database_tx') === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {getStepStatus('database_tx') === 'current' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : getStepStatus('database_tx') === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Finalizando Registro</p>
                <p className="text-xs text-muted-foreground">
                  {getStepStatus('database_tx') === 'current'
                    ? 'Atualizando com hash da transação...'
                    : getStepStatus('database_tx') === 'completed'
                    ? 'Registro finalizado com sucesso'
                    : 'Aguardando confirmação da blockchain'}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Hash */}
          {createTx && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Transação Confirmada
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white p-1 rounded border flex-1 truncate">
                  {createTx}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://sepolia.etherscan.io/tx/${createTx}`,
                      '_blank',
                    )
                  }
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isCompleted && (
            <div className="text-center space-y-3">
              <div className="text-green-600">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                <p className="font-medium">Tarefa criada com sucesso!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecionando para suas tarefas em alguns segundos...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
