'use client'

import { useState, useActionState, useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { parseEther } from 'viem'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema, CreateTaskInput } from '@/lib/schemas/task'

// Tipo específico para o formulário
type CreateTaskFormData = Omit<CreateTaskInput, 'links' | 'attachments'> & {
  links: Array<{ url: string; description: string }>
  attachments: Array<{ name: string; url: string; size?: number }>
}
import { createTask, updateTaskWithContractHash } from '@/actions/tasks'
import { APP_CONFIG } from '@/lib/web3/config'

type FormStep =
  | 'form'
  | 'confirm'
  | 'database'
  | 'blockchain'
  | 'database_tx'
  | 'success'
  | 'nonce_error'

export function useCreateTask() {
  const { address, isConnected } = useAccount()

  // Server actions
  const [createState, createAction, isCreatePending] = useActionState(
    createTask,
    {
      errors: {},
      message: '',
      success: false,
      taskId: '',
    },
  )

  const [updateState, updateAction, isUpdatePending] = useActionState(
    updateTaskWithContractHash,
    { success: false, message: '' },
  )

  const [isTransitioning, startTransition] = useTransition()

  // Web3 contract interaction
  const {
    writeContract,
    data: hash,
    isPending: isContractPending,
    error: contractError,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isContractSuccess } =
    useWaitForTransactionReceipt({ hash })

  // Form
  const form = useForm<CreateTaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      valueInEther: '',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      allowOverdue: false,
      links: [] as Array<{ url: string; description: string }>,
      attachments: [] as Array<{ name: string; url: string; size?: number }>,
    },
  })

  // Local state - apenas o essencial
  const [currentStep, setCurrentStep] = useState<FormStep>('form')

  // Actions
  const submitToDatabase = async (data: CreateTaskFormData) => {
    try {
      setCurrentStep('database')

      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      if (data.requirements) formData.append('requirements', data.requirements)
      formData.append('valueInEther', data.valueInEther)
      formData.append('deadline', data.deadline.toISOString())
      formData.append('allowOverdue', data.allowOverdue.toString())
      formData.append('links', JSON.stringify(data.links))
      formData.append('attachments', JSON.stringify(data.attachments))
      if (address) formData.append('walletAddress', address)

      startTransition(() => createAction(formData))
    } catch (error) {
      console.error('Erro ao criar task:', error)
      resetOnError()
    }
  }

  const createTaskContract = async (
    data: CreateTaskFormData,
    taskId: string,
  ) => {
    try {
      setCurrentStep('blockchain')

      const deadlineTimestamp = Math.floor(data.deadline.getTime() / 1000)
      const taskValue = parseEther(data.valueInEther)
      const platformFee = (taskValue * BigInt(3)) / BigInt(100)
      const totalValue = taskValue + platformFee

      writeContract({
        address: APP_CONFIG.contracts.gitFreelas.address,
        abi: APP_CONFIG.contracts.gitFreelas.abi,
        functionName: 'createTask',
        args: [taskId, BigInt(deadlineTimestamp), data.allowOverdue],
        value: totalValue,
      })
    } catch (error) {
      console.error('Erro ao criar task no contrato:', error)

      // Tratamento específico para erro de nonce
      const errorMessage = (error as any)?.message || ''
      if (errorMessage.includes('nonce too low')) {
        console.error('Erro de nonce detectado. Por favor:')
        console.error('1. Abra o MetaMask')
        console.error('2. Vá em Configurações > Avançado')
        console.error('3. Clique em "Reset Account"')
        console.error('4. Tente novamente')
        setCurrentStep('nonce_error')
        return
      }

      resetOnError()
    }
  }

  // Navigation helpers
  const goToConfirmStep = () => setCurrentStep('confirm')
  const goBackToForm = () => setCurrentStep('form')
  const resetOnError = () => setCurrentStep('form')
  const retryAfterNonceError = () => {
    setCurrentStep('blockchain')
    const formData = form.getValues()
    createTaskContract(formData, taskId)
  }

  // Computed states
  const isPending = isCreatePending || isUpdatePending || isTransitioning
  const isCreating = isContractPending || isConfirming
  const taskId = createState.taskId

  // Auto-flow: Database created → Contract
  useEffect(() => {
    if (createState.success && taskId && currentStep === 'database') {
      const formData = form.getValues()
      createTaskContract(formData, taskId)
    }
  }, [createState.success, taskId, currentStep])

  // Auto-flow: Contract confirmed → Update hash
  useEffect(() => {
    if (isContractSuccess && hash && taskId && currentStep === 'blockchain') {
      setCurrentStep('database_tx')

      const formData = new FormData()
      formData.append('taskId', taskId)
      formData.append('contractTxHash', hash)

      startTransition(() => updateAction(formData))
    }
  }, [isContractSuccess, hash, taskId, currentStep])

  // Auto-flow: Update success → Final success
  useEffect(() => {
    if (updateState.success && currentStep === 'database_tx') {
      setCurrentStep('success')
    }
  }, [updateState.success, currentStep])

  // Error handling - consolidado
  useEffect(() => {
    // Verificar erros específicos
    const createError = createState.message && !createState.success
    const contractErrorMsg =
      contractError?.message ||
      contractError?.name ||
      (contractError ? 'Contract error' : null)
    const updateError = updateState.message && !updateState.success

    // Só processar se há algum erro real
    if (createError || contractErrorMsg || updateError) {
      const errorDetails = {
        createError: createError ? createState.message : null,
        contractError: contractErrorMsg,
        updateError: updateError ? updateState.message : null,
      }

      // Log apenas se há conteúdo real de erro
      if (
        errorDetails.createError ||
        errorDetails.contractError ||
        errorDetails.updateError
      ) {
        console.error('Erro detectado:', errorDetails)
        resetOnError()
      }
    }
  }, [createState, contractError, updateState])

  return {
    // Form & navigation
    form,
    currentStep,
    goToConfirmStep,
    goBackToForm,
    resetOnError,
    retryAfterNonceError,

    // States
    state: createState,
    isPending,
    isCreating,
    createSuccess: isContractSuccess,
    createError: contractError,
    createTx: hash,
    isConnected,

    // Actions
    submitToDatabase,
  }
}
