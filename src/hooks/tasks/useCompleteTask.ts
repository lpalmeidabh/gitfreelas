'use client'

import { useState, useActionState, useTransition } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { submitTaskForApproval } from '@/actions/developers'
import { APP_CONFIG } from '@/lib/web3/config'
import { toast } from 'sonner'

export type CompleteStep = 'confirm' | 'blockchain' | 'database' | 'success'

export function useCompleteTask() {
  const { address, isConnected } = useAccount()

  // Server action
  const [state, formAction, isPending] = useActionState(submitTaskForApproval, {
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
  const [currentStep, setCurrentStep] = useState<CompleteStep>('confirm')
  const [isProcessing, setIsProcessing] = useState(false)

  // Complete task on contract (client approves)
  const completeTaskOnContract = async (taskId: string) => {
    try {
      setIsProcessing(true)
      setCurrentStep('blockchain')

      toast.loading('Completando tarefa no contrato...')

      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'completeTask',
        args: [taskId],
      })
    } catch (error) {
      console.error('Erro ao completar task no contrato:', error)
      toast.error('Erro ao processar transação')
      resetOnError()
      throw error
    }
  }

  // Submit for approval (developer submits work)
  const submitForApproval = async (taskId: string) => {
    try {
      setCurrentStep('database')
      toast.loading('Submetendo para aprovação...')

      startTransition(() => {
        formAction(taskId)
      })
    } catch (error) {
      console.error('Erro ao submeter para aprovação:', error)
      toast.error('Erro ao submeter tarefa')
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
    completeTaskOnContract, // Para cliente aprovar
    submitForApproval, // Para desenvolvedor submeter
    resetOnError,
    resetToInitial,

    // Computed states
    isCompleting: isContractPending || isConfirming,
    isSubmitting: isPending || isTransitioning,
    hasError: !!(contractError || state.error),
    errorMessage: contractError?.message || state.error,
  }
}
