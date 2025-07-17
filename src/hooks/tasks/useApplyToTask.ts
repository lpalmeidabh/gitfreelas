'use client'

import { useState, useActionState, useTransition, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { applyToTask as applyToTaskAction } from '@/actions/developers'
import { toast } from 'sonner'

export type ApplyStep =
  | 'confirm'
  | 'signing'
  | 'submitting'
  | 'success'
  | 'error'

export function useApplyToTask() {
  const { address, isConnected } = useAccount()

  // Server action
  const [state, formAction, isPending] = useActionState(applyToTaskAction, {
    success: false,
    error: '',
  })

  const [isTransitioning, startTransition] = useTransition()

  // Signature
  const {
    signMessage,
    data: signature,
    isPending: isSigning,
    error: signError,
    reset: resetSignature,
  } = useSignMessage()

  // Local states
  const [currentStep, setCurrentStep] = useState<ApplyStep>('confirm')
  const [currentTaskId, setCurrentTaskId] = useState<string>('')

  // Auto-transition: Signature confirmed → Database save
  useEffect(
    function handleSignatureReceived() {
      if (signature && currentTaskId && address && currentStep === 'signing') {
        setCurrentStep('submitting')

        const formData = new FormData()
        formData.append('taskId', currentTaskId)
        formData.append('walletAddress', address)
        formData.append('signature', signature)

        startTransition(function submitFormData() {
          formAction(formData)
        })
      }
    },
    [
      signature,
      currentTaskId,
      address,
      currentStep,
      formAction,
      startTransition,
    ],
  )

  // Handle success/error after form submission
  useEffect(
    function handleFormResponse() {
      if (state.success && currentStep === 'submitting') {
        setCurrentStep('success')
      }

      if (state.error && currentStep === 'submitting') {
        setCurrentStep('error')
      }
    },
    [state.success, state.error, currentStep],
  )

  // Main apply function
  async function applyToTask(taskId: string) {
    if (!isConnected || !address) {
      toast.error('Conecte sua carteira para aplicar')
      return
    }

    try {
      setCurrentTaskId(taskId)
      setCurrentStep('signing')

      const message = `Aplicar para tarefa ${taskId}\nEndereço: ${address}\nTimestamp: ${Date.now()}`

      await signMessage({ message })
    } catch (error) {
      console.error('Erro na aplicação:', error)
      setCurrentStep('error')
    }
  }

  // Reset function
  function resetToInitial() {
    setCurrentStep('confirm')
    setCurrentTaskId('')
    resetSignature()
  }

  return {
    // States
    currentStep,
    currentTaskId,

    // Connection
    isConnected,
    address,

    // Actions
    applyToTask,
    resetToInitial,

    // Computed states
    isProcessing: currentStep === 'signing' || currentStep === 'submitting',
    errorMessage: signError?.message || state.error,
    canCloseModal: currentStep === 'confirm' || currentStep === 'error',
  }
}
