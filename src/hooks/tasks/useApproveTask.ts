'use client'

import { useState, useActionState, useTransition } from 'react'
import { useAccount } from 'wagmi'
import { acceptDeveloper, rejectDeveloper } from '@/actions/developers'
import { toast } from 'sonner'

export type ApprovalAction = 'accept' | 'reject'
export type ApprovalStep = 'confirm' | 'processing' | 'success'

export function useApproveTask() {
  const { address, isConnected } = useAccount()

  // Server actions - usando as actions diretamente
  const [acceptState, acceptAction, isAcceptPending] = useActionState(
    acceptDeveloper,
    {
      success: false,
      error: '',
    },
  )

  const [rejectState, rejectAction, isRejectPending] = useActionState(
    rejectDeveloper,
    {
      success: false,
      error: '',
    },
  )

  const [isTransitioning, startTransition] = useTransition()

  // Local states
  const [currentStep, setCurrentStep] = useState<ApprovalStep>('confirm')
  const [currentAction, setCurrentAction] = useState<ApprovalAction | null>(
    null,
  )

  // Accept developer function (renomeada para evitar conflito)
  const handleAcceptDeveloper = async (taskId: string) => {
    try {
      setCurrentAction('accept')
      setCurrentStep('processing')
      toast.loading('Aceitando desenvolvedor...')

      startTransition(() => {
        acceptAction(taskId)
      })
    } catch (error) {
      console.error('Erro ao aceitar desenvolvedor:', error)
      toast.error('Erro ao aceitar desenvolvedor')
      resetOnError()
    }
  }

  // Reject developer function (renomeada para evitar conflito)
  const handleRejectDeveloper = async (taskId: string) => {
    try {
      setCurrentAction('reject')
      setCurrentStep('processing')
      toast.loading('Rejeitando desenvolvedor...')

      startTransition(() => {
        rejectAction(taskId)
      })
    } catch (error) {
      console.error('Erro ao rejeitar desenvolvedor:', error)
      toast.error('Erro ao rejeitar desenvolvedor')
      resetOnError()
    }
  }

  // Navigation helpers
  const resetOnError = () => {
    setCurrentStep('confirm')
    setCurrentAction(null)
    toast.dismiss()
  }

  const resetToInitial = () => {
    setCurrentStep('confirm')
    setCurrentAction(null)
  }

  // Get current state based on action
  const getCurrentState = () => {
    if (currentAction === 'accept') return acceptState
    if (currentAction === 'reject') return rejectState
    return { success: false, error: '' }
  }

  const getCurrentPending = () => {
    if (currentAction === 'accept') return isAcceptPending
    if (currentAction === 'reject') return isRejectPending
    return false
  }

  return {
    // States
    currentStep,
    currentAction,

    // Server action states
    acceptState,
    rejectState,
    state: getCurrentState(),
    isPending: getCurrentPending() || isTransitioning,

    // Connection state
    isConnected,
    address,

    // Actions (renomeadas para evitar conflito)
    acceptDeveloper: handleAcceptDeveloper,
    rejectDeveloper: handleRejectDeveloper,
    resetOnError,
    resetToInitial,

    // Computed states
    isProcessing: getCurrentPending() || isTransitioning,
    hasError: !!getCurrentState().error,
    errorMessage: getCurrentState().error,
    isSuccess: getCurrentState().success,
  }
}
