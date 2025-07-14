'use client'

import { useState, useActionState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema, CreateTaskInput } from '@/lib/schemas/task'
import { createTask } from '@/actions/tasks'
import { useGitFreelas } from './useGitFreelas'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'

type FormStep = 'form' | 'confirm' | 'blockchain' | 'database'

export function useCreateTask() {
  const { address, isConnected } = useAccount()

  // Server action state com useTransition
  const [state, formAction, isPending] = useActionState(createTask, {
    errors: {},
    message: '',
    success: false,
  })

  // Usar useTransition para chamar formAction corretamente
  const [isTransitioning, startTransition] = useTransition()

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

  // Web3 integration
  const {
    createTask: createTaskOnContract,
    isCreating,
    createSuccess,
    createError,
    createTx,
  } = useGitFreelas()

  // Estados locais
  const [currentStep, setCurrentStep] = useState<FormStep>('form')
  const [isProcessing, setIsProcessing] = useState(false)

  // Função para criar task no contrato
  // Função para criar task no contrato
  const createTaskContract = async (data: CreateTaskInput) => {
    try {
      setIsProcessing(true)
      setCurrentStep('blockchain')

      toast.loading('Enviando transação para o contrato...')

      // ✅ Simplesmente calcular o timestamp como number
      const deadlineTimestamp = Math.floor(data.deadline.getTime() / 1000)

      await createTaskOnContract(
        `temp-${Date.now()}`,
        deadlineTimestamp, // ✅ Passar como number - função se encarrega da conversão
        data.allowOverdue,
        data.valueInEther,
      )
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

    // ✅ Usar startTransition para chamar formAction
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
    isPending: isPending || isTransitioning, // ✅ Combinar ambos os pendings

    // Web3 state
    isCreating,
    createSuccess,
    createError,
    createTx,
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
