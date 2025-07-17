'use client'

import { useState, useActionState, useTransition, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { applyToTask as applyToTaskAction } from '@/actions/developers'
import { useRouter } from 'next/navigation'

export type ApplyStep =
  | 'confirm'
  | 'signing'
  | 'submitting'
  | 'success'
  | 'error'

export function useApplyToTask() {
  const router = useRouter()
  const { address, isConnected } = useAccount()

  // Server action
  const [state, formAction, isPending] = useActionState(applyToTaskAction, {
    success: false,
    error: '',
  })

  const [isTransitioning, startTransition] = useTransition()

  // Signature (sem gas)
  const {
    signMessage,
    data: signature,
    isPending: isSigning,
    error: signError,
  } = useSignMessage()

  // Local states
  const [currentStep, setCurrentStep] = useState<ApplyStep>('confirm')
  const [currentTaskId, setCurrentTaskId] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Auto-transition: Signature confirmed → Database save
  useEffect(() => {
    if (signature && currentTaskId && address && currentStep === 'signing') {
      submitToDatabase(currentTaskId, address, signature)
    }
  }, [signature, currentTaskId, address, currentStep])

  // Auto-transition: Database saved → Success (MANTÉM O MODAL)
  useEffect(() => {
    if (state.success && currentStep === 'submitting') {
      setCurrentStep('success') // ← MODAL DE SUCESSO
      setIsProcessing(false)
    }
  }, [state.success, currentStep])

  // Handle errors
  useEffect(() => {
    if (signError && currentStep === 'signing') {
      setCurrentStep('error')
      setIsProcessing(false)
    }
  }, [signError, currentStep])

  useEffect(() => {
    if (state.error && currentStep === 'submitting') {
      setCurrentStep('error')
      setIsProcessing(false)
    }
  }, [state.error, currentStep])

  // Sign message first (no gas)
  const signApplication = async (taskId: string) => {
    try {
      setIsProcessing(true)
      setCurrentStep('signing')
      setCurrentTaskId(taskId)

      const message = `Aplicar para tarefa ${taskId}\nEndereço: ${address}\nTimestamp: ${Date.now()}`

      signMessage({ message })
    } catch (error) {
      console.error('Erro ao assinar:', error)
      resetOnError()
      throw error
    }
  }

  // Submit to database after signature
  const submitToDatabase = (
    taskId: string,
    walletAddress: string,
    messageSignature: string,
  ) => {
    setCurrentStep('submitting')

    const formData = new FormData()
    formData.append('taskId', taskId)
    formData.append('walletAddress', walletAddress)
    formData.append('signature', messageSignature)

    startTransition(() => {
      formAction(formData)
    })
  }

  // Main apply function
  const applyToTask = async (taskId: string) => {
    if (!isConnected || !address) {
      return
    }

    try {
      await signApplication(taskId)
    } catch (error) {
      console.error('Erro na aplicação:', error)
    }
  }

  // Close modal and refresh - só chama quando usuário clica "Entendi"
  const handleClose = () => {
    router.refresh()
  }

  // Reset helpers
  const resetOnError = () => {
    setCurrentStep('confirm')
    setIsProcessing(false)
    setCurrentTaskId('')
  }

  const resetToInitial = () => {
    setCurrentStep('confirm')
    setIsProcessing(false)
    setCurrentTaskId('')
  }

  return {
    // States
    currentStep,
    isProcessing,

    // Server action state
    state,
    isPending: isPending || isTransitioning,

    // Signature states
    isSigning,
    signature,
    signError,

    // Connection state
    isConnected,
    address,

    // Actions
    applyToTask,
    handleClose,
    resetOnError,
    resetToInitial,

    // Computed states
    isSubmitting: isPending || isTransitioning,
    hasError: !!(signError || state.error),
    errorMessage: signError?.message || state.error,
    isComplete: currentStep === 'success',

    // Prevent modal close when processing
    canCloseModal:
      !isProcessing &&
      (currentStep === 'confirm' ||
        currentStep === 'success' ||
        currentStep === 'error'),
  }
}
