// src/components/tasks/review/task-review-actions.tsx
'use client'

import React, { useState, useActionState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Clock,
  Wallet,
  ExternalLink,
} from 'lucide-react'
import { TaskWithRelations } from '@/types'
import { type PullRequestInfo } from './task-code-review'
import { useCompleteTask } from '@/hooks/tasks/useCompleteTask'
import {
  approveTaskCompletion,
  rejectTaskSubmission,
  requestTaskRevision,
} from '@/actions/code-review'
import { ConnectWallet } from '@/components/web3/connect-wallet'
import { toast } from 'sonner'

interface TaskReviewActionsProps {
  task: TaskWithRelations
  selectedPR: PullRequestInfo
}

export function TaskReviewActions({
  task,
  selectedPR,
}: TaskReviewActionsProps) {
  const [feedback, setFeedback] = useState('')
  const [currentAction, setCurrentAction] = useState<
    'approve' | 'reject' | 'revision' | null
  >(null)

  // Hook existente para blockchain
  const {
    currentStep,
    isConnected,
    isCompleting,
    hasError: contractError,
    errorMessage: contractErrorMessage,
    completeTaskOnContract,
    resetOnError,
    contractTx,
  } = useCompleteTask()

  // Server actions para database
  const [rejectState, rejectAction, isRejectPending] = useActionState(
    rejectTaskSubmission,
    {
      success: false,
      error: '',
    },
  )

  const [revisionState, revisionAction, isRevisionPending] = useActionState(
    requestTaskRevision,
    {
      success: false,
      error: '',
    },
  )

  const [approveState, approveAction, isApprovePending] = useActionState(
    approveTaskCompletion,
    {
      success: false,
      error: '',
    },
  )

  const [isTransitioning, startTransition] = useTransition()

  const isProcessing =
    isCompleting ||
    isRejectPending ||
    isRevisionPending ||
    isApprovePending ||
    isTransitioning

  const handleApprove = async () => {
    setCurrentAction('approve')
    toast.loading('Processando aprovação na blockchain...')

    try {
      await completeTaskOnContract(task.id)
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      setCurrentAction(null)
      toast.error('Erro ao processar transação')
    }
  }

  const handleReject = async () => {
    if (!feedback.trim()) {
      toast.error('Por favor, forneça um motivo para a rejeição')
      return
    }

    setCurrentAction('reject')
    toast.loading('Processando rejeição...')

    const formData = new FormData()
    formData.append('taskId', task.id)
    formData.append('prNumber', selectedPR.number.toString())
    formData.append('feedback', feedback)

    startTransition(() => {
      rejectAction(formData)
    })
  }

  const handleRequestRevision = async () => {
    if (!feedback.trim()) {
      toast.error('Por favor, forneça feedback para as correções')
      return
    }

    setCurrentAction('revision')
    toast.loading('Enviando solicitação de correções...')

    const formData = new FormData()
    formData.append('taskId', task.id)
    formData.append('prNumber', selectedPR.number.toString())
    formData.append('feedback', feedback)

    startTransition(() => {
      revisionAction(formData)
    })
  }

  // Handle blockchain transaction success
  React.useEffect(() => {
    if (currentStep === 'success' && currentAction === 'approve') {
      // Após sucesso da blockchain, atualizar database
      const formData = new FormData()
      formData.append('taskId', task.id)
      formData.append('prNumber', selectedPR.number.toString())
      formData.append('feedback', feedback)

      startTransition(() => {
        approveAction(formData)
      })
    }
  }, [
    currentStep,
    currentAction,
    task.id,
    selectedPR.number,
    feedback,
    approveAction,
  ])

  // Handle success states
  React.useEffect(() => {
    if (approveState.success) {
      toast.success('Trabalho aprovado com sucesso!')
      setTimeout(() => window.location.reload(), 1000)
    }
    if (rejectState.success) {
      toast.success('Trabalho rejeitado!')
      setTimeout(() => window.location.reload(), 1000)
    }
    if (revisionState.success) {
      toast.success('Correções solicitadas!')
      setTimeout(() => window.location.reload(), 1000)
    }
  }, [approveState.success, rejectState.success, revisionState.success])

  // Handle error states
  React.useEffect(() => {
    if (contractError) {
      toast.error(`Erro na blockchain: ${contractErrorMessage}`)
      setCurrentAction(null)
    }
    if (approveState.error) {
      toast.error(`Erro ao aprovar: ${approveState.error}`)
      setCurrentAction(null)
    }
    if (rejectState.error) {
      toast.error(`Erro ao rejeitar: ${rejectState.error}`)
      setCurrentAction(null)
    }
    if (revisionState.error) {
      toast.error(`Erro ao solicitar correções: ${revisionState.error}`)
      setCurrentAction(null)
    }
  }, [
    contractError,
    contractErrorMessage,
    approveState.error,
    rejectState.error,
    revisionState.error,
  ])

  // Mostrar processamento
  if (isProcessing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            {currentAction === 'approve' && currentStep === 'blockchain'
              ? 'Processando na Blockchain'
              : currentAction === 'approve' && currentStep === 'database'
              ? 'Atualizando Sistema'
              : currentAction === 'reject'
              ? 'Processando Rejeição'
              : currentAction === 'revision'
              ? 'Enviando Correções'
              : 'Processando...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>

            {currentAction === 'approve' && (
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep === 'blockchain'
                      ? 'text-blue-600'
                      : currentStep === 'database' || currentStep === 'success'
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div className="h-2 w-2 rounded-full bg-current"></div>
                  <span className="text-sm">Transação na blockchain</span>
                  {contractTx && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${contractTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    isApprovePending
                      ? 'text-blue-600'
                      : approveState.success
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div className="h-2 w-2 rounded-full bg-current"></div>
                  <span className="text-sm">Atualizando sistema</span>
                </div>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Não feche esta janela durante o processamento
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Interface normal
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Revisar Entrega
        </CardTitle>
        <CardDescription>
          Aprove o trabalho, rejeite ou solicite correções
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isConnected && (
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Conecte sua carteira para processar ações</span>
              <ConnectWallet />
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Ao aprovar, uma transação blockchain
            será executada para liberar o pagamento. Rejeição e solicitação de
            correções são apenas atualizações do sistema.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="feedback">Feedback / Comentários</Label>
          <Textarea
            id="feedback"
            placeholder="Forneça feedback sobre o trabalho entregue..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Este feedback será enviado ao desenvolvedor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={handleApprove}
            className="w-full"
            size="lg"
            disabled={!isConnected || isProcessing}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar e Pagar
          </Button>

          <Button
            onClick={handleRequestRevision}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={!feedback.trim() || isProcessing}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Solicitar Correções
          </Button>

          <Button
            onClick={handleReject}
            variant="destructive"
            className="w-full"
            size="lg"
            disabled={!feedback.trim() || isProcessing}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeitar e Cancelar
          </Button>
        </div>

        <div className="bg-gray-50 rounded p-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Valor da Tarefa:</span>
              <div>{parseFloat(task.valueInWei) / 1e18} ETH</div>
            </div>
            <div>
              <span className="font-medium">Desenvolvedor:</span>
              <div>{task.taskDeveloper?.developer.name}</div>
            </div>
            <div>
              <span className="font-medium">PR:</span>
              <div>
                #{selectedPR.number} - {selectedPR.title}
              </div>
            </div>
            <div>
              <span className="font-medium">Deadline:</span>
              <div>{task.deadline.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
