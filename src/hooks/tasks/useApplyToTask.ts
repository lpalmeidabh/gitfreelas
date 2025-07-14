'use client'

import { useState, useActionState, useTransition } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { applyToTask as applyToTaskAction } from '@/actions/developers'
import { APP_CONFIG } from '@/lib/web3/config'
import { toast } from 'sonner'

export type ApplyStep = 'confirm' | 'blockchain' | 'database' | 'success'

export function useApplyToTask() {
  const { address, isConnected } = useAccount()

  // Server action com useTransition
  const [state, formAction, isPending] = useActionState(applyToTaskAction, {
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
  const [currentStep, setCurrentStep] = useState<ApplyStep>('confirm')
  const [isProcessing, setIsProcessing] = useState(false)

  // Apply to contract first
  const applyToContract = async (taskId: string) => {
    try {
      setIsProcessing(true)
      setCurrentStep('blockchain')

      toast.loading('Enviando aplicação para o contrato...')

      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'applyToTask',
        args: [taskId],
      })
    } catch (error) {
      console.error('Erro ao aplicar no contrato:', error)
      toast.error('Erro ao processar transação')
      resetOnError()
      throw error
    }
  }

  // Submit to database after contract confirmation
  const submitToDatabase = (
    taskId: string,
    walletAddress: string,
    txHash: string,
  ) => {
    setCurrentStep('database')
    toast.loading('Salvando aplicação no banco de dados...')

    // Call server action using FormData approach
    const formData = new FormData()
    formData.append('taskId', taskId)
    formData.append('walletAddress', walletAddress)
    formData.append('contractTxHash', txHash)

    startTransition(() => {
      formAction(formData)
    })
  }

  // Combined apply function (Web3 + Server Action)
  const applyToTask = async (taskId: string) => {
    if (!isConnected || !address) {
      toast.error('Conecte sua carteira para aplicar')
      return
    }

    try {
      await applyToContract(taskId)
    } catch (error) {
      console.error('Erro na aplicação:', error)
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
    applyToTask,
    submitToDatabase,
    resetOnError,
    resetToInitial,

    // Computed states
    isApplying: isContractPending || isConfirming,
    isSubmittingToDb: isPending || isTransitioning,
    hasError: !!(contractError || state.error),
    errorMessage: contractError?.message || state.error,
  }
}
