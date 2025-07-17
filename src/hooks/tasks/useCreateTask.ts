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
import { createTask, updateTaskWithContractHash } from '@/actions/tasks'
import { APP_CONFIG } from '@/lib/web3/config'

type FormStep =
  | 'form'
  | 'confirm'
  | 'database'
  | 'blockchain'
  | 'database_tx'
  | 'success'

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
  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      valueInEther: '',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      allowOverdue: false,
    },
  })

  // Local state - apenas o essencial
  const [currentStep, setCurrentStep] = useState<FormStep>('form')

  // Actions
  const submitToDatabase = async (data: CreateTaskInput) => {
    try {
      setCurrentStep('database')

      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      if (data.requirements) formData.append('requirements', data.requirements)
      formData.append('valueInEther', data.valueInEther)
      formData.append('deadline', data.deadline.toISOString())
      formData.append('allowOverdue', data.allowOverdue.toString())
      if (address) formData.append('walletAddress', address)

      startTransition(() => createAction(formData))
    } catch (error) {
      console.error('Erro ao criar task:', error)
      resetOnError()
    }
  }

  const createTaskContract = async (data: CreateTaskInput, taskId: string) => {
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
      resetOnError()
    }
  }

  // Navigation helpers
  const goToConfirmStep = () => setCurrentStep('confirm')
  const goBackToForm = () => setCurrentStep('form')
  const resetOnError = () => setCurrentStep('form')

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
    const hasError =
      (createState.message && !createState.success) ||
      contractError ||
      (updateState.message && !updateState.success)

    if (hasError) {
      console.error('Erro detectado:', {
        createError: createState.message,
        contractError: contractError?.message,
        updateError: updateState.message,
      })
      resetOnError()
    }
  }, [createState, contractError, updateState])

  return {
    // Form & navigation
    form,
    currentStep,
    goToConfirmStep,
    goBackToForm,
    resetOnError,

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
