'use client'

import { useState, useActionState, useTransition, useEffect } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { acceptDeveloper, rejectDeveloper } from '@/actions/developers'
import { APP_CONFIG } from '@/lib/web3/config'
import { toast } from 'sonner'

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

  // Transaction confirmation
  const { isLoading: isConfirming, isSuccess: isContractSuccess } =
    useWaitForTransactionReceipt({
      hash,
    })

  // Local states
  const [currentStep, setCurrentStep] = useState<ApprovalStep>('confirm')
  const [currentAction, setCurrentAction] = useState<ApprovalAction | null>(
    null,
  )
  const [pendingTaskId, setPendingTaskId] = useState<string>('')

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 Hook initialized')
      setIsInitialized(true)
    }
  }, [isInitialized])

  useEffect(() => {
    console.log('🔄 State Change:', {
      currentAction,
      currentStep,
      pendingTaskId,
      isContractPending,
      isConfirming,
      isContractSuccess,
      hash,
    })
  }, [
    currentAction,
    currentStep,
    pendingTaskId,
    isContractPending,
    isConfirming,
    isContractSuccess,
    hash,
  ])

  // Auto-transition: Contract confirmed → Database save
  useEffect(() => {
    console.log('🔍 DEBUG Contract Success:', {
      isContractSuccess,
      currentAction,
      pendingTaskId,
      hash,
    })

    if (isContractSuccess && currentAction === 'accept' && pendingTaskId) {
      console.log('✅ Contract success detected, calling server action...')
      setCurrentStep('database')
      toast.dismiss()
      toast.loading('Criando repositório e atualizando status...')

      startTransition(() => {
        acceptAction(pendingTaskId)
      })
    }
  }, [isContractSuccess, currentAction, pendingTaskId, hash])

  // Escutar mudanças nos estados das actions para gerenciar toasts
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
        toast.dismiss()
        toast.success('Desenvolvedor aceito com sucesso!')
        setCurrentStep('success')
      } else if (acceptState.error) {
        console.log('❌ Server action error:', acceptState.error)
        toast.dismiss()
        toast.error(`Erro: ${acceptState.error}`)
        setCurrentStep('confirm')
        setCurrentAction(null)
        setPendingTaskId('')
      }
    }
  }, [acceptState, currentAction, currentStep])

  useEffect(() => {
    if (currentAction === 'reject') {
      if (rejectState.success) {
        toast.dismiss()
        toast.success('Aplicação rejeitada com sucesso!')
        setCurrentStep('success')
      } else if (rejectState.error) {
        toast.dismiss()
        toast.error(`Erro: ${rejectState.error}`)
        setCurrentStep('confirm')
        setCurrentAction(null)
      }
    }
  }, [rejectState, currentAction])

  // Handle contract errors
  useEffect(() => {
    if (contractError && currentAction === 'accept') {
      toast.dismiss()
      toast.error(`Erro no contrato: ${contractError.message}`)
      setCurrentStep('confirm')
      setCurrentAction(null)
      setPendingTaskId('')
    }
  }, [contractError, currentAction])

  // Accept developer function - calls contract first
  const handleAcceptDeveloper = async (
    taskId: string,
    developerWalletAddress: string,
  ) => {
    try {
      setCurrentAction('accept')
      setCurrentStep('blockchain')
      setPendingTaskId(taskId)
      toast.loading('Confirmando no blockchain...')

      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'acceptDeveloper',
        args: [taskId, developerWalletAddress as `0x${string}`],
      })
    } catch (error) {
      console.error('Erro ao aceitar desenvolvedor:', error)
      toast.dismiss()
      toast.error('Erro ao processar transação')
      resetOnError()
    }
  }

  // Reject developer function - only database (no contract)
  const handleRejectDeveloper = async (taskId: string) => {
    try {
      setCurrentAction('reject')
      setCurrentStep('database')
      toast.loading('Rejeitando aplicação...')

      startTransition(() => {
        rejectAction(taskId)
      })
    } catch (error) {
      console.error('Erro ao rejeitar desenvolvedor:', error)
      toast.dismiss()
      toast.error('Erro ao rejeitar desenvolvedor')
      resetOnError()
    }
  }

  // Navigation helpers
  const resetOnError = () => {
    setCurrentStep('confirm')
    setCurrentAction(null)
    setPendingTaskId('')
    toast.dismiss()
  }

  const resetToInitial = () => {
    setCurrentStep('confirm')
    setCurrentAction(null)
    setPendingTaskId('')
    toast.dismiss()
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
    isContractSuccess,
    contractError,
    contractTx: hash,

    // Connection state
    isConnected,
    address,

    // Actions (atualizadas para receber wallet address)
    acceptDeveloper: handleAcceptDeveloper,
    rejectDeveloper: handleRejectDeveloper,
    resetOnError,
    resetToInitial,

    // Computed states
    isProcessing: getCurrentPending() || isTransitioning,
    hasError: !!(contractError || getCurrentState().error),
    errorMessage: contractError?.message || getCurrentState().error,
    isSuccess: getCurrentState().success,

    // New states for blockchain steps
    isBlockchainStep: currentStep === 'blockchain',
    isDatabaseStep: currentStep === 'database',
  }
}
