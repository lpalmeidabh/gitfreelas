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
export type ApprovalStep = 'confirm' | 'blockchain' | 'database' | 'success'

export function useApproveTask() {
  const { address, isConnected } = useAccount()

  // Server actions
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

  // Web3 contract interaction
  const {
    writeContract,
    data: hash,
    isPending: isContractPending,
    error: contractError,
  } = useWriteContract()
  const contract = APP_CONFIG.contracts.gitFreelas

  // Transaction confirmation with enhanced configuration
  const {
    isLoading: isConfirming,
    isSuccess: isContractSuccess,
    isError: isReceiptError,
    error: receiptError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
      retry: 3,
      retryDelay: 1000,
      refetchInterval: 1000,
    },
    confirmations: 1,
    timeout: 30000,
  })

  // Local states
  const [currentStep, setCurrentStep] = useState<ApprovalStep>('confirm')
  const [currentAction, setCurrentAction] = useState<ApprovalAction | null>(
    null,
  )
  const [pendingTaskId, setPendingTaskId] = useState<string>('')

  // Auto-transition: Contract confirmed → Database save
  useEffect(() => {
    console.log('🔍 DEBUG Contract Success:', {
      isContractSuccess,
      currentAction,
      pendingTaskId,
      hash,
      receipt: receipt
        ? {
            status: receipt.status,
            blockNumber: receipt.blockNumber,
          }
        : null,
    })

    if (isContractSuccess && currentAction === 'accept' && pendingTaskId) {
      console.log('✅ Contract success detected, calling server action...')
      setCurrentStep('database')

      startTransition(() => {
        acceptAction(pendingTaskId)
      })
    }
  }, [isContractSuccess, currentAction, pendingTaskId, hash, receipt])

  // Escutar mudanças nos estados das actions
  useEffect(() => {
    console.log('🔍 DEBUG Server Action:', {
      currentAction,
      acceptStateSuccess: acceptState.success,
      acceptStateError: acceptState.error,
      currentStep,
    })

    if (currentAction === 'accept') {
      if (acceptState.success && currentStep === 'database') {
        console.log('✅ Server action success!')
        setCurrentStep('success')
      } else if (acceptState.error) {
        console.log('❌ Server action error:', acceptState.error)
        setCurrentStep('confirm')
        setCurrentAction(null)
        setPendingTaskId('')
      }
    }
  }, [acceptState, currentAction, currentStep])

  useEffect(() => {
    if (currentAction === 'reject') {
      if (rejectState.success) {
        setCurrentStep('success')
      } else if (rejectState.error) {
        setCurrentStep('confirm')
        setCurrentAction(null)
      }
    }
  }, [rejectState, currentAction])

  // Handle contract errors
  useEffect(() => {
    if (contractError && currentAction === 'accept') {
      console.error('❌ Contract error:', contractError.message)
      setCurrentStep('confirm')
      setCurrentAction(null)
      setPendingTaskId('')
    }
  }, [contractError, currentAction])

  // Handle receipt errors
  useEffect(() => {
    if (isReceiptError && receiptError && currentAction === 'accept') {
      console.error('❌ Receipt error:', receiptError)
      setCurrentStep('confirm')
      setCurrentAction(null)
      setPendingTaskId('')
    }
  }, [isReceiptError, receiptError, currentAction])

  // Accept developer function - calls contract first usando contractTaskId
  const handleAcceptDeveloper = async (
    taskId: string,
    developerWalletAddress: string,
    contractTaskId: string, // ← NOVO: ID usado no contrato
  ) => {
    try {
      setCurrentAction('accept')
      setCurrentStep('blockchain')
      setPendingTaskId(taskId) // ID do banco para server action

      console.log('🔍 DEBUG Enviando transação para aceitar desenvolvedor:', {
        taskId,
        developerWalletAddress,
      })

      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'acceptDeveloper',
        args: [taskId, developerWalletAddress as `0x${string}`], // ← Usar contractTaskId
      })
    } catch (error) {
      console.error('Erro ao aceitar desenvolvedor:', error)
      resetOnError()
    }
  }

  // Reject developer function - only database (no contract)
  const handleRejectDeveloper = async (taskId: string) => {
    try {
      setCurrentAction('reject')
      setCurrentStep('database')

      startTransition(() => {
        rejectAction(taskId)
      })
    } catch (error) {
      console.error('Erro ao rejeitar desenvolvedor:', error)
      resetOnError()
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

  // Get current state based on action
  const getCurrentState = () => {
    if (currentAction === 'accept') return acceptState
    if (currentAction === 'reject') return rejectState
    return { success: false, error: '' }
  }

  const getCurrentPending = () => {
    if (currentAction === 'accept') {
      return isContractPending || isConfirming || isAcceptPending
    }
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

    // Web3 states
    isContractPending,
    isConfirming,
    isContractSuccess: isContractSuccess,
    contractError,
    contractTx: hash,
    receipt,

    // Connection state
    isConnected,
    address,

    // Actions (atualizado para receber contractTaskId)
    acceptDeveloper: handleAcceptDeveloper,
    rejectDeveloper: handleRejectDeveloper,
    resetOnError,
    resetToInitial,

    // Computed states
    isProcessing: getCurrentPending() || isTransitioning,
    hasError: !!(contractError || receiptError || getCurrentState().error),
    errorMessage:
      contractError?.message ||
      receiptError?.message ||
      getCurrentState().error,
    isSuccess: getCurrentState().success,

    // New states for blockchain steps
    isBlockchainStep: currentStep === 'blockchain',
    isDatabaseStep: currentStep === 'database',
  }
}
