'use client'

import { useState, useActionState, useTransition } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { cancelTaskApplication } from '@/actions/developers'
import { APP_CONFIG } from '@/lib/web3/config'
import { toast } from 'sonner'

export type CancelStep = 'confirm' | 'blockchain' | 'database' | 'success'

export function useCancelTask() {
  const { address, isConnected } = useAccount()

  // Server action
  const [state, formAction, isPending] = useActionState(cancelTaskApplication, {
    success: false,
    error: '',
  })

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
  const [currentStep, setCurrentStep] = useState<CancelStep>('confirm')
  const [isProcessing, setIsProcessing] = useState(false)

  // Cancel task on contract (client cancels before developer applies)
  const cancelTaskOnContract = async (taskId: string, reason: string) => {
    try {
      setIsProcessing(true)
      setCurrentStep('blockchain')

      toast.loading('Cancelando tarefa no contrato...')

      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'cancelTask',
        args: [taskId, reason],
      })
    } catch (error) {
      console.error('Erro ao cancelar task no contrato:', error)
      toast.error('Erro ao processar transação')
      resetOnError()
      throw error
    }
  }

  // Cancel application (developer cancels their application)
  const cancelApplication = async (taskId: string) => {
    try {
      setCurrentStep('database')
      toast.loading('Cancelando aplicação...')

      startTransition(() => {
        formAction(taskId)
      })
    } catch (error) {
      console.error('Erro ao cancelar aplicação:', error)
      toast.error('Erro ao cancelar aplicação')
      resetOnError()
    }
  }

  // Navigation helpers
  const resetOnError = () => {
    setCurrentStep('confirm')
    setIsProcessing(false)
    toast.dismiss()
  }

  const resetToInitial = () => {
    setCurrentStep('confirm')
    setIsProcessing(false)
  }

  return {
    // States
    currentStep,
    isProcessing,

    // Server action state
    state,
    isPending: isPending || isTransitioning,

    // Web3 states
    isContractPending,
    isConfirming,
    isContractSuccess,
    contractError,
    contractTx: hash,

    // Connection state
    isConnected,
    address,

    // Actions
    cancelTaskOnContract, // Para cliente cancelar task
    cancelApplication, // Para desenvolvedor cancelar aplicação
    resetOnError,
    resetToInitial,

    // Computed states
    isCanceling: isContractPending || isConfirming,
    isCancelingApp: isPending || isTransitioning,
    hasError: !!(contractError || state.error),
    errorMessage: contractError?.message || state.error,
  }
}
