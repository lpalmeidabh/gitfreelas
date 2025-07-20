// src/components/tasks/review/code-review-progress.tsx
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
  Github,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import React from 'react'

type ReviewStep = 'blockchain' | 'database' | 'github' | 'success'
type ReviewAction = 'approve' | 'reject' | 'revision'

interface CodeReviewProgressProps {
  currentStep: ReviewStep
  currentAction: ReviewAction
  isProcessing: boolean
  githubResults?: {
    comment: boolean
    merge: boolean
    ownership: boolean
  } | null
  errorMessage?: string
  txHash?: string
  onRetry?: () => void
  onClose?: () => void
}

export function CodeReviewProgress({
  currentStep,
  currentAction,
  isProcessing,
  githubResults,
  errorMessage,
  txHash,
  onRetry,
  onClose,
}: CodeReviewProgressProps) {
  const router = useRouter()

  // Helper functions
  const getStepStatus = (step: 'blockchain' | 'database' | 'github') => {
    const steps = ['blockchain', 'database', 'github']
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)

    // Se completou tudo, marcar todos como completed
    if (currentStep === 'success') return 'completed'

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  const getProgressPercentage = () => {
    if (currentStep === 'success') return 100

    switch (currentStep) {
      case 'blockchain':
        return currentAction === 'approve' ? 33 : 100 // Approve tem 3 steps, outros só 1
      case 'database':
        return currentAction === 'approve' ? 66 : 100
      case 'github':
        return 90
      default:
        return 0
    }
  }

  const getActionTitle = () => {
    switch (currentAction) {
      case 'approve':
        return currentStep === 'success'
          ? 'Trabalho Aprovado!'
          : 'Aprovando Trabalho...'
      case 'reject':
        return currentStep === 'success'
          ? 'Trabalho Rejeitado'
          : 'Rejeitando Trabalho...'
      case 'revision':
        return currentStep === 'success'
          ? 'Correções Solicitadas'
          : 'Solicitando Correções...'
    }
  }

  const getActionDescription = () => {
    if (currentStep === 'success') {
      switch (currentAction) {
        case 'approve':
          return 'Pagamento liberado e repositório transferido para o cliente'
        case 'reject':
          return 'Tarefa cancelada e valor devolvido ao cliente'
        case 'revision':
          return 'Desenvolvedor foi notificado sobre as correções necessárias'
      }
    }

    switch (currentAction) {
      case 'approve':
        return 'Processando aprovação em etapas: blockchain, sistema e GitHub'
      case 'reject':
        return 'Cancelando tarefa e notificando desenvolvedor'
      case 'revision':
        return 'Enviando feedback para o desenvolvedor'
    }
  }

  // Error state
  if (errorMessage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Erro no Processamento
          </CardTitle>
          <CardDescription>
            Ocorreu um erro durante o processamento da ação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="flex gap-3">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="flex-1">
                Tentar Novamente
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              Recarregar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {currentStep === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
          {getActionTitle()}
        </CardTitle>
        <CardDescription>{getActionDescription()}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progresso</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Steps - apenas para approve que tem múltiplos steps */}
        {currentAction === 'approve' && (
          <div className="space-y-4">
            {/* Step 1: Blockchain */}
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
                <p className="font-medium text-sm">Transação Blockchain</p>
                <p className="text-xs text-muted-foreground">
                  {getStepStatus('blockchain') === 'current'
                    ? 'Confirmando pagamento na rede...'
                    : getStepStatus('blockchain') === 'completed'
                    ? 'Pagamento liberado com sucesso'
                    : 'Aguardando processamento anterior'}
                </p>
              </div>
            </div>

            {/* Step 2: Database */}
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
                <p className="font-medium text-sm">Atualizando Sistema</p>
                <p className="text-xs text-muted-foreground">
                  {getStepStatus('database') === 'current'
                    ? 'Finalizando tarefa no sistema...'
                    : getStepStatus('database') === 'completed'
                    ? 'Tarefa finalizada no sistema'
                    : 'Aguardando blockchain'}
                </p>
              </div>
            </div>

            {/* Step 3: GitHub */}
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                getStepStatus('github') === 'current'
                  ? 'bg-blue-50 border-blue-200'
                  : getStepStatus('github') === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-muted/50',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  getStepStatus('github') === 'current'
                    ? 'bg-blue-600 text-white'
                    : getStepStatus('github') === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {getStepStatus('github') === 'current' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : getStepStatus('github') === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Finalizando no GitHub</p>
                <p className="text-xs text-muted-foreground">
                  {getStepStatus('github') === 'current'
                    ? 'Fechando PR e transferindo repositório...'
                    : getStepStatus('github') === 'completed'
                    ? 'PR fechada e repositório transferido'
                    : 'Aguardando sistema'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GitHub Results Details (only for approve and when available) */}
        {currentAction === 'approve' && githubResults && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Detalhes GitHub:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                {githubResults.comment ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
                <span>Comentário</span>
              </div>
              <div className="flex items-center gap-1">
                {githubResults.merge ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
                <span>Merge PR</span>
              </div>
              <div className="flex items-center gap-1">
                {githubResults.ownership ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
                <span>Transferência</span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Link */}
        {txHash && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `https://sepolia.etherscan.io/tx/${txHash}`,
                  '_blank',
                )
              }
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Ver Transação
            </Button>
          </div>
        )}

        {/* Success Actions */}
        {currentStep === 'success' && (
          <div className="pt-4 border-t space-y-3">
            {currentAction === 'approve' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>💰 Pagamento liberado automaticamente</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>📁 Repositório transferido para o cliente</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>✅ Trabalho concluído com sucesso</span>
                </div>
              </div>
            )}

            <Button onClick={() => window.location.reload()} className="w-full">
              Finalizar
            </Button>
          </div>
        )}

        {/* Warning for ongoing process */}
        {isProcessing && currentStep !== 'success' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não feche esta página durante o processamento da{' '}
              {currentAction === 'approve'
                ? 'aprovação'
                : currentAction === 'reject'
                ? 'rejeição'
                : 'solicitação'}
              .
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
