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
import { CodeReviewProgress } from './code-review-progress'

interface TaskReviewActionsProps {
  task: TaskWithRelations
  selectedPR: PullRequestInfo
}

type ReviewStep = 'form' | 'blockchain' | 'database' | 'github' | 'success'
type ReviewAction = 'approve' | 'reject' | 'revision' | null

export function TaskReviewActions({
  task,
  selectedPR,
}: TaskReviewActionsProps) {
  const [feedback, setFeedback] = useState('')
  const [currentStep, setCurrentStep] = useState<ReviewStep>('form')
  const [currentAction, setCurrentAction] = useState<ReviewAction>(null)
  const [githubResults, setGithubResults] = useState<{
    comment: boolean
    merge: boolean
    ownership: boolean
  } | null>(null)

  // Hook para blockchain (apenas aprovação)
  const {
    currentStep: hookStep,
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
    { success: false, error: '' },
  )

  const [revisionState, revisionAction, isRevisionPending] = useActionState(
    requestTaskRevision,
    { success: false, error: '' },
  )

  const [approveState, approveAction, isApprovePending] = useActionState(
    approveTaskCompletion,
    { success: false, error: '' },
  )

  const [isTransitioning, startTransition] = useTransition()

  // Computed states
  const isProcessing =
    isCompleting ||
    isRejectPending ||
    isRevisionPending ||
    isApprovePending ||
    isTransitioning
  const errorMessage =
    contractErrorMessage ||
    approveState.error ||
    rejectState.error ||
    revisionState.error

  // Handlers
  async function handleApprove() {
    setCurrentAction('approve')
    setCurrentStep('blockchain')

    try {
      await completeTaskOnContract(task.id, selectedPR.number, feedback)
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      setCurrentStep('form')
      setCurrentAction(null)
    }
  }

  async function handleReject() {
    if (!feedback.trim()) return

    setCurrentAction('reject')
    setCurrentStep('database')

    const formData = new FormData()
    formData.append('taskId', task.id)
    formData.append('prNumber', selectedPR.number.toString())
    formData.append('feedback', feedback)

    startTransition(() => {
      rejectAction(formData)
    })
  }

  async function handleRequestRevision() {
    if (!feedback.trim()) return

    setCurrentAction('revision')
    setCurrentStep('database')

    const formData = new FormData()
    formData.append('taskId', task.id)
    formData.append('prNumber', selectedPR.number.toString())
    formData.append('feedback', feedback)

    startTransition(() => {
      revisionAction(formData)
    })
  }

  function resetToForm() {
    setCurrentStep('form')
    setCurrentAction(null)
    setGithubResults(null)
    resetOnError()
  }

  // ===== EVENT MONITORING =====

  // 1. Monitor blockchain success (apenas para approve)
  React.useEffect(() => {
    if (
      hookStep === 'success' &&
      currentAction === 'approve' &&
      currentStep === 'blockchain'
    ) {
      console.log('✅ Blockchain confirmada, chamando database...')
      setCurrentStep('database')

      const formData = new FormData()
      formData.append('taskId', task.id)
      formData.append('prNumber', selectedPR.number.toString())
      formData.append('feedback', feedback)

      startTransition(() => {
        approveAction(formData)
      })
    }
  }, [
    hookStep,
    currentAction,
    currentStep,
    task.id,
    selectedPR?.number,
    feedback,
    approveAction,
  ])

  // 2. Monitor database success
  React.useEffect(() => {
    // Aprovação: blockchain → database → github → success
    if (
      approveState.success &&
      currentStep === 'database' &&
      currentAction === 'approve'
    ) {
      console.log('✅ Database atualizada, iniciando GitHub actions...')
      setCurrentStep('github')

      // Simular tempo das GitHub actions (elas rodam na server action)
      setTimeout(() => {
        console.log('✅ GitHub actions concluídas')
        setGithubResults({ comment: true, merge: true, ownership: true })
        setCurrentStep('success')
      }, 2000)
    }

    // Rejeição: database → success (direto)
    if (rejectState.success && currentAction === 'reject') {
      console.log('✅ Rejeição processada')
      setCurrentStep('success')
    }

    // Revisão: database → success (direto)
    if (revisionState.success && currentAction === 'revision') {
      console.log('✅ Revisão solicitada')
      setCurrentStep('success')
    }
  }, [
    approveState.success,
    rejectState.success,
    revisionState.success,
    currentStep,
    currentAction,
  ])

  // 3. Monitor errors
  React.useEffect(() => {
    if (
      contractError ||
      approveState.error ||
      rejectState.error ||
      revisionState.error
    ) {
      console.error('❌ Erro detectado:', {
        contractError: contractErrorMessage,
        approveError: approveState.error,
        rejectError: rejectState.error,
        revisionError: revisionState.error,
      })
      // Errors são handled pelo CodeReviewProgress component
    }
  }, [
    contractError,
    contractErrorMessage,
    approveState.error,
    rejectState.error,
    revisionState.error,
  ])

  // ===== RENDER LOGIC =====

  // Show progress component if not in form step
  if (currentStep !== 'form') {
    return (
      <CodeReviewProgress
        currentStep={currentStep}
        currentAction={currentAction!}
        isProcessing={isProcessing}
        githubResults={githubResults}
        errorMessage={errorMessage}
        txHash={contractTx}
        onRetry={resetToForm}
        onClose={() => window.location.reload()}
      />
    )
  }

  // Form state (default)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Revisar Trabalho
        </CardTitle>
        <CardDescription>
          Pull Request #{selectedPR.number} - {selectedPR.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feedback Input */}
        <div className="space-y-2">
          <Label htmlFor="feedback">
            Feedback{' '}
            {currentAction === 'reject' || currentAction === 'revision'
              ? '(obrigatório)'
              : '(opcional)'}
          </Label>
          <Textarea
            id="feedback"
            placeholder={
              currentAction === 'reject'
                ? 'Explique o motivo da rejeição...'
                : currentAction === 'revision'
                ? 'Descreva as correções necessárias...'
                : 'Forneça feedback sobre o trabalho entregue...'
            }
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
          {(currentAction === 'reject' || currentAction === 'revision') &&
            !feedback.trim() && (
              <p className="text-sm text-red-600">
                Este campo é obrigatório para esta ação
              </p>
            )}
        </div>

        {/* Wallet Connection Check */}
        {!isConnected && (
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Para aprovar o trabalho e liberar o pagamento, você precisa
              conectar sua carteira Web3.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => {
              setCurrentAction('approve')
              handleApprove()
            }}
            disabled={!isConnected || isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar
          </Button>

          <Button
            onClick={() => {
              setCurrentAction('revision')
              if (feedback.trim()) {
                handleRequestRevision()
              }
            }}
            disabled={!feedback.trim() || isProcessing}
            variant="outline"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Solicitar Correções
          </Button>

          <Button
            onClick={() => {
              setCurrentAction('reject')
              if (feedback.trim()) {
                handleReject()
              }
            }}
            disabled={!feedback.trim() || isProcessing}
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeitar
          </Button>
        </div>

        {/* Validation Messages */}
        {currentAction === 'reject' && !feedback.trim() && (
          <Alert variant="destructive">
            <AlertDescription>
              É obrigatório fornecer um motivo para rejeitar o trabalho.
            </AlertDescription>
          </Alert>
        )}

        {currentAction === 'revision' && !feedback.trim() && (
          <Alert variant="destructive">
            <AlertDescription>
              É obrigatório fornecer feedback sobre as correções necessárias.
            </AlertDescription>
          </Alert>
        )}

        {/* Connect Wallet */}
        {!isConnected && (
          <div className="pt-4 border-t">
            <ConnectWallet />
          </div>
        )}

        {/* PR Link */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(selectedPR.html_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Pull Request no GitHub
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
