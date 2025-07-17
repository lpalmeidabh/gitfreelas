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

  // Server action para criar no banco
  const [createState, createAction, isCreatePending] = useActionState(
    createTask,
    {
      errors: {},
      message: '',
      success: false,
      taskId: '',
    },
  )

  // Server action para atualizar hash
  const [updateState, updateAction, isUpdatePending] = useActionState(
    updateTaskWithContractHash,
    {
      success: false,
      message: '',
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

  // React Hook Form
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

  // Estados locais
  const [currentStep, setCurrentStep] = useState<FormStep>('form')
  const [isProcessing, setIsProcessing] = useState(false)
  const [createdTaskId, setCreatedTaskId] = useState<string>('')

  // Step 1: Criar no banco primeiro
  const submitToDatabase = async (data: CreateTaskInput) => {
    try {
      setIsProcessing(true)
      setCurrentStep('database')

      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      if (data.requirements) formData.append('requirements', data.requirements)
      formData.append('valueInEther', data.valueInEther)
      formData.append('deadline', data.deadline.toISOString())
      formData.append('allowOverdue', data.allowOverdue.toString())
      if (address) formData.append('walletAddress', address)

      startTransition(() => {
        createAction(formData)
      })
    } catch (error) {
      console.error('Erro ao criar task:', error)
      resetOnError()
    }
  }

  // Step 2: Criar no contrato com ID do banco
  const createTaskContract = async (data: CreateTaskInput, taskId: string) => {
    try {
      setCurrentStep('blockchain')

      const deadlineTimestamp = Math.floor(data.deadline.getTime() / 1000)
      const taskValue = parseEther(data.valueInEther)
      const platformFee = (taskValue * BigInt(3)) / BigInt(100) // 3%
      const totalValue = taskValue + platformFee

      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'createTask',
        args: [taskId, BigInt(deadlineTimestamp), data.allowOverdue],
        value: totalValue,
      })
    } catch (error) {
      console.error('Erro ao criar task no contrato:', error)
      resetOnError()
      throw error
    }
  }

  // Fluxo automático: Banco criado → Contrato
  useEffect(() => {
    if (
      createState.success &&
      createState.taskId &&
      currentStep === 'database'
    ) {
      console.log('✅ Task criada no banco, ID:', createState.taskId)
      setCreatedTaskId(createState.taskId)
      const formData = form.getValues()
      createTaskContract(formData, createState.taskId)
    }
  }, [createState.success, createState.taskId, currentStep])

  // Fluxo automático: Contrato confirmado → Atualizar hash
  useEffect(() => {
    if (
      isContractSuccess &&
      hash &&
      createdTaskId &&
      currentStep === 'blockchain'
    ) {
      console.log('✅ Contrato confirmado, hash:', hash)

      setCurrentStep('database_tx')
      const formData = new FormData()
      formData.append('taskId', createdTaskId)
      formData.append('contractTxHash', hash)

      startTransition(() => {
        updateAction(formData)
      })
    }
  }, [isContractSuccess, hash, createdTaskId, currentStep])

  // Sucesso final
  useEffect(() => {
    if (updateState.success && currentStep === 'database_tx') {
      setCurrentStep('success')
      setIsProcessing(false)
    }
  }, [updateState.success, currentStep])

  // Handle errors CORRIGIDO
  useEffect(() => {
    // Verificar erro no create
    if (createState.message && !createState.success) {
      console.error('Erro na criação da task:', createState.message)
      resetOnError()
      return
    }

    // Verificar erro no contrato
    if (contractError) {
      console.error('Erro no contrato:', contractError.message)
      resetOnError()
      return
    }

    // Verificar erro no update
    if (updateState.message && !updateState.success) {
      console.error('Erro na atualização:', updateState.message)
      resetOnError()
      return
    }
  }, [
    createState.message,
    createState.success,
    contractError,
    updateState.message,
    updateState.success,
  ])

  // Funções de navegação
  const goToConfirmStep = () => setCurrentStep('confirm')
  const goBackToForm = () => {
    setCurrentStep('form')
    setIsProcessing(false)
  }

  const resetOnError = () => {
    setCurrentStep('form')
    setIsProcessing(false)
    setCreatedTaskId('')
  }

  return {
    // Form state
    form,
    currentStep,
    isProcessing,

    // Server action state
    state: createState,
    isPending: isCreatePending || isUpdatePending || isTransitioning,

    // Web3 state

    isCreating: isContractPending || isConfirming,
    createSuccess: isContractSuccess,
    createError: contractError,
    createTx: hash,
    isConnected,
    address,

    // Actions
    createTaskContract,
    submitToDatabase,
    goToConfirmStep,
    goBackToForm,
    resetOnError,

    // Debug
    createdTaskId,
  }
}
