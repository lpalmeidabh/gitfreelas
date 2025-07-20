// src/hooks/tasks/useCompleteTask.ts
'use client'

import React, { useState, useActionState, useTransition } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { submitTaskForApproval } from '@/actions/developers'
import {
  approveTaskCompletion,
  rejectTaskSubmission,
  requestTaskRevision,
} from '@/actions/code-review'
import { APP_CONFIG } from '@/lib/web3/config'

export type CompleteStep =
  | 'confirm'
  | 'blockchain'
  | 'database'
  | 'success'
  | 'error'

export interface CompleteTaskData {
  taskId: string
  prNumber?: number
  feedback?: string
  action: 'submit' | 'approve' | 'reject' | 'revision'
}

export function useCompleteTask() {
  const { address, isConnected } = useAccount()

  // Server actions
  const [submitState, submitAction, isSubmitPending] = useActionState(
    submitTaskForApproval,
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

  const [isTransitioning, startTransition] = useTransition()

  // Web3 contract interaction
  const {
    writeContract,
    data: hash,
    isPending: isContractPending,
    error: contractError,
    reset: resetContract,
  } = useWriteContract()

  const contract = APP_CONFIG.contracts.gitFreelas

  // Transaction confirmation
  const { isLoading: isConfirming, isSuccess: isContractSuccess } =
    useWaitForTransactionReceipt({
      hash,
    })

  // Local states
  const [currentStep, setCurrentStep] = useState<CompleteStep>('confirm')
  const [currentData, setCurrentData] = useState<CompleteTaskData | null>(null)

  // Main complete task workflow
  const completeTask = async (data: CompleteTaskData) => {
    try {
      setCurrentData(data)

      if (data.action === 'approve') {
        // Para aprovação, precisa chamar blockchain primeiro
        await handleBlockchainApproval(data.taskId)
      } else if (data.action === 'submit') {
        // Para submit do desenvolvedor, só database
        await handleSubmitForApproval(data.taskId)
      } else {
        // Para reject/revision, só database
        await handleDatabaseUpdate(data)
      }
    } catch (error) {
      console.error('Erro no fluxo de complete task:', error)
      setCurrentStep('error')
    }
  }

  // Step 1: Blockchain approval (só para approve)
  const handleBlockchainApproval = async (taskId: string) => {
    try {
      setCurrentStep('blockchain')

      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'completeTask',
        args: [taskId],
      })
    } catch (error) {
      console.error('Erro ao chamar contrato:', error)
      setCurrentStep('error')
    }
  }

  // Submit for approval (developer submits work)
  const handleSubmitForApproval = async (taskId: string) => {
    try {
      setCurrentStep('database')

      startTransition(() => {
        submitAction(taskId)
      })
    } catch (error) {
      console.error('Erro ao submeter para aprovação:', error)
      setCurrentStep('error')
    }
  }

  // Step 2: Update database após blockchain ou direto
  const handleDatabaseUpdate = async (data: CompleteTaskData) => {
    try {
      setCurrentStep('database')

      const formData = new FormData()
      formData.append('taskId', data.taskId)
      if (data.prNumber) formData.append('prNumber', data.prNumber.toString())
      if (data.feedback) formData.append('feedback', data.feedback)

      startTransition(() => {
        switch (data.action) {
          case 'approve':
            approveAction(formData)
            break
          case 'reject':
            rejectAction(formData)
            break
          case 'revision':
            revisionAction(formData)
            break
        }
      })
    } catch (error) {
      console.error('Erro ao atualizar database:', error)
      setCurrentStep('error')
    }
  }

  // ===== UPDATED: Legacy functions with extra parameters =====
  const completeTaskOnContract = async (
    taskId: string,
    prNumber?: number,
    feedback?: string,
  ) => {
    await completeTask({
      taskId,
      action: 'approve',
      prNumber,
      feedback,
    })
  }

  const submitForApproval = async (taskId: string) => {
    await completeTask({
      taskId,
      action: 'submit',
    })
  }

  // Monitor blockchain transaction success
  React.useEffect(() => {
    if (isContractSuccess && currentStep === 'blockchain' && currentData) {
      console.log('✅ Transação blockchain confirmada!')
      setCurrentStep('success') // Sinaliza sucesso para o componente
      // O database update será chamado pelo componente
    }
  }, [isContractSuccess, currentStep, currentData])

  // Monitor database update success
  React.useEffect(() => {
    const getCurrentState = () => {
      if (currentData?.action === 'submit') return submitState
      if (currentData?.action === 'approve') return approveState
      if (currentData?.action === 'reject') return rejectState
      if (currentData?.action === 'revision') return revisionState
      return { success: false, error: '' }
    }

    const state = getCurrentState()
    if (state.success && currentStep === 'database') {
      setCurrentStep('success')
    }
  }, [
    submitState.success,
    approveState.success,
    rejectState.success,
    revisionState.success,
    currentStep,
    currentData,
  ])

  // Monitor errors
  React.useEffect(() => {
    if (contractError) {
      setCurrentStep('error')
    }

    const getCurrentError = () => {
      if (currentData?.action === 'submit') return submitState.error
      if (currentData?.action === 'approve') return approveState.error
      if (currentData?.action === 'reject') return rejectState.error
      if (currentData?.action === 'revision') return revisionState.error
      return ''
    }

    const error = getCurrentError()
    if (error) {
      setCurrentStep('error')
    }
  }, [
    contractError,
    submitState.error,
    approveState.error,
    rejectState.error,
    revisionState.error,
    currentData,
  ])

  // Reset function
  const resetFlow = () => {
    setCurrentStep('confirm')
    setCurrentData(null)
    resetContract()
  }

  // Legacy reset functions
  const resetOnError = () => {
    resetFlow()
  }

  const resetToInitial = () => {
    resetFlow()
  }

  // Get current processing state
  const isProcessing =
    isContractPending ||
    isConfirming ||
    isSubmitPending ||
    isApprovePending ||
    isRejectPending ||
    isRevisionPending ||
    isTransitioning ||
    currentStep === 'blockchain' ||
    currentStep === 'database'

  // Get current state based on action
  const getCurrentState = () => {
    if (currentData?.action === 'submit') return submitState
    if (currentData?.action === 'approve') return approveState
    if (currentData?.action === 'reject') return rejectState
    if (currentData?.action === 'revision') return revisionState
    return { success: false, error: '' }
  }

  return {
    // Main API
    completeTask,
    resetFlow,

    // States
    currentStep,
    currentData,
    isConnected,
    address,
    isProcessing,

    // ===== UPDATED: Legacy API with extra parameters =====
    completeTaskOnContract, // Agora aceita (taskId, prNumber?, feedback?)
    submitForApproval,
    resetOnError,
    resetToInitial,

    // Computed states
    hasError: !!(contractError || getCurrentState().error),
    errorMessage: contractError?.message || getCurrentState().error,
    isSuccess: currentStep === 'success',
    canClose: currentStep !== 'blockchain' && currentStep !== 'database',

    // Transaction data
    txHash: hash,
    state: getCurrentState(),

    // Legacy states (backward compatibility)
    isCompleting: isContractPending || isConfirming,
    isSubmitting: isSubmitPending || isTransitioning,
    contractError,
    contractTx: hash,
    isContractPending,
    isConfirming,
    isContractSuccess,
    isPending: isSubmitPending || isTransitioning,
  }
}
