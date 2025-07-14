'use client'

import { useState, useActionState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { parseEther } from 'viem'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema, CreateTaskInput } from '@/lib/schemas/task'
import { createTask } from '@/actions/tasks'
import { APP_CONFIG } from '@/lib/web3/config'
import { toast } from 'sonner'

type FormStep = 'form' | 'confirm' | 'blockchain' | 'database'

export function useCreateTask() {
  const { address, isConnected } = useAccount()

  // Server action state
  const [state, formAction, isPending] = useActionState(createTask, {
    errors: {},
    message: '',
    success: false,
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

  // Função para criar task no contrato
  const createTaskContract = async (data: CreateTaskInput) => {
    try {
      setIsProcessing(true)
      setCurrentStep('blockchain')

      toast.loading('Enviando transação para o contrato...')

      const deadlineTimestamp = Math.floor(data.deadline.getTime() / 1000)
      const taskValue = parseEther(data.valueInEther)
      const platformFee = (taskValue * BigInt(3)) / BigInt(100) // 3%
      const totalValue = taskValue + platformFee

      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'createTask',
        args: [
          `temp-${Date.now()}`,
          BigInt(deadlineTimestamp),
          data.allowOverdue,
        ],
        value: totalValue,
      })
    } catch (error) {
      console.error('Erro ao criar task no contrato:', error)
      toast.error('Erro ao processar transação')
      setCurrentStep('form')
      setIsProcessing(false)
      throw error
    }
  }

  // Função para enviar para o banco após confirmação do contrato
  const submitToDatabase = (data: CreateTaskInput, txHash: string) => {
    setCurrentStep('database')
    toast.loading('Salvando task no banco de dados...')

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    if (data.requirements) formData.append('requirements', data.requirements)
    formData.append('valueInEther', data.valueInEther)
    formData.append('deadline', data.deadline.toISOString())
    formData.append('allowOverdue', data.allowOverdue.toString())
    formData.append('contractTxHash', txHash)
    if (address) formData.append('walletAddress', address)

    startTransition(() => {
      formAction(formData)
    })
  }

  // Funções de navegação
  const goToConfirmStep = () => setCurrentStep('confirm')
  const goBackToForm = () => {
    setCurrentStep('form')
    setIsProcessing(false)
  }

  // Reset quando há erro
  const resetOnError = () => {
    setCurrentStep('form')
    setIsProcessing(false)
    toast.dismiss()
  }

  return {
    // Form state
    form,
    currentStep,
    isProcessing,

    // Server action state
    state,
    isPending: isPending || isTransitioning,

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
  }
}
