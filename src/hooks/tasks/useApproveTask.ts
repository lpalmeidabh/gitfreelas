'use client'

import { useState, useActionState, useTransition, useEffect } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { acceptDeveloper, rejectDeveloper } from '@/actions/developers'
import { APP_CONFIG } from '@/lib/web3/config'

export type ApprovalAction = 'accept' | 'reject'
export type ApprovalStep = 'confirm' | 'processing' | 'success' | 'error'

export function useApproveTask() {
  const { address, isConnected } = useAccount()

  // Server actions
  const [acceptState, acceptAction, isAcceptPending] = useActionState(
    acceptDeveloper,
    { success: false, error: '' },
  )

  const [rejectState, rejectAction, isRejectPending] = useActionState(
    rejectDeveloper,
    { success: false, error: '' },
  )

  const [isTransitioning, startTransition] = useTransition()

  // Web3 contract interaction (reativado)
  const {
    writeContract,
    data: hash,
    isPending: isContractPending,
    error: contractError,
  } = useWriteContract()
  const contract = APP_CONFIG.contracts.gitFreelas

  const { isLoading: isConfirming, isSuccess: isContractSuccess } =
    useWaitForTransactionReceipt({
      hash,
      confirmations: 1,
      timeout: 30000,
    })

  // Local states
  const [currentStep, setCurrentStep] = useState<ApprovalStep>('confirm')
  const [currentAction, setCurrentAction] = useState<ApprovalAction | null>(
    null,
  )
  const [pendingTaskId, setPendingTaskId] = useState<string>('')

  // Auto-transition: Contract success → Database save (REATIVADO)
  useEffect(() => {
    if (isContractSuccess && currentAction === 'accept' && pendingTaskId) {
      console.log('✅ Contract confirmed, calling server action...')

      startTransition(() => {
        acceptAction(pendingTaskId)
      })
    }
  }, [isContractSuccess, currentAction, pendingTaskId])

  // Handle server action results
  useEffect(() => {
    if (currentAction === 'accept' && acceptState.success) {
      // Adicionar delay para garantir que o modal de sucesso seja exibido
      setTimeout(() => {
        setCurrentStep('success')
      }, 500)
    } else if (currentAction === 'accept' && acceptState.error) {
      setCurrentStep('error')
    }
  }, [acceptState, currentAction])

  useEffect(() => {
    if (currentAction === 'reject' && rejectState.success) {
      setCurrentStep('success')
    } else if (currentAction === 'reject' && rejectState.error) {
      setCurrentStep('error')
    }
  }, [rejectState, currentAction])

  // Handle contract errors
  useEffect(() => {
    if (contractError && currentAction === 'accept') {
      setCurrentStep('error')
    }
  }, [contractError, currentAction])

  // Accept developer - REATIVADO: blockchain first, then database
  // Accept developer function - calls contract first
  const handleAcceptDeveloper = async (
    taskId: string,
    developerWalletAddress: string,
    // ← REMOVIDO: contractTaskId (redundante)
  ) => {
    try {
      setCurrentAction('accept')
      setCurrentStep('processing')
      setPendingTaskId(taskId)

      console.log('🔍 DEBUG Enviando transação para aceitar desenvolvedor:', {
        taskId,
        developerWalletAddress,
      })

      // Usar taskId diretamente (sem parâmetro extra)
      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'acceptDeveloper',
        args: [taskId, developerWalletAddress as `0x${string}`],
      })
    } catch (error) {
      console.error('Erro ao aceitar desenvolvedor:', error)
      setCurrentStep('error')
    }
  }

  // Reject developer - database only (sem contrato)
  const handleRejectDeveloper = async (taskId: string) => {
    try {
      setCurrentAction('reject')
      setCurrentStep('processing')

      startTransition(() => {
        rejectAction(taskId)
      })
    } catch (error) {
      console.error('Erro ao rejeitar desenvolvedor:', error)
      setCurrentStep('error')
    }
  }

  // Navigation helpers
  const resetOnError = () => {
    setCurrentStep('confirm')
    setCurrentAction(null)
    setPendingTaskId('')
  }

  const resetToInitial = () => {
    setCurrentStep('confirm')
    setCurrentAction(null)
    setPendingTaskId('')
  }

  // Get current state
  const getCurrentState = () => {
    if (currentAction === 'accept') return acceptState
    if (currentAction === 'reject') return rejectState
    return { success: false, error: '' }
  }

  const getCurrentPending = () => {
    if (currentAction === 'accept')
      return isContractPending || isConfirming || isAcceptPending
    if (currentAction === 'reject') return isRejectPending
    return false
  }

  return {
    // States
    currentStep,
    currentAction,
    isConnected,
    address,

    // Actions
    acceptDeveloper: handleAcceptDeveloper,
    rejectDeveloper: handleRejectDeveloper,
    resetOnError,
    resetToInitial,

    // Computed states
    isProcessing: getCurrentPending() || isTransitioning,
    hasError: !!(contractError || getCurrentState().error),
    errorMessage: contractError?.message || getCurrentState().error,
    isSuccess: getCurrentState().success && currentStep === 'success',
    canCloseModal: currentStep !== 'processing',

    // Current state data
    state: getCurrentState(),
  }
}
