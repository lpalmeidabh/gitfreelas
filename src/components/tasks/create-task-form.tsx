'use client'

import { useEffect } from 'react'
import { useCreateTask } from '@/hooks/tasks/useCreateTask'
import { useTaskCalculations } from '@/hooks/web3/useTaskCalculations'
import { NetworkGuard } from '@/components/web3/network-guard'
import { TaskFormStep } from './create/task-form-step'
import { TaskConfirmationStep } from './create/task-confirmation-step'
import { TaskProgressStep } from './create/task-progress-step'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CreateTaskForm() {
  const router = useRouter()
  const {
    form,
    currentStep,
    isProcessing,
    state,
    isPending,
    isCreating,
    createSuccess,
    createError,
    createTx,
    isConnected,
    createTaskContract,
    submitToDatabase,
    goToConfirmStep,
    goBackToForm,
    resetOnError,
  } = useCreateTask()

  const { calculateTaskCosts } = useTaskCalculations()

  // Calcular custos em tempo real
  const costs = calculateTaskCosts(form.watch('valueInEther'))

  useEffect(() => {
    if (currentStep === 'success') {
      setTimeout(() => {
        toast.success('Tarefa criada com sucesso!')
      }, 100)
    }
  }, [currentStep, router])

  useEffect(() => {
    if (createError) {
      console.error('Erro no contrato:', createError.message)
      resetOnError()
    }
  }, [createError])

  // Handler para envio do formulário (step 1)
  const onSubmit = form.handleSubmit(async (data) => {
    if (!isConnected) {
      toast.error('Conecte sua carteira para criar uma tarefa')
      return
    }

    goToConfirmStep()
  })

  // Handler para confirmação (step 2)
  const onConfirm = async () => {
    const data = form.getValues()
    await submitToDatabase(data)
  }

  // Renderizar step correto
  if (currentStep === 'confirm') {
    return (
      <TaskConfirmationStep
        formData={form.getValues()}
        costs={costs}
        platformFee={3}
        isSubmitting={isProcessing}
        onBack={goBackToForm}
        onConfirm={onConfirm}
      />
    )
  }

  if (
    currentStep === 'database' ||
    currentStep === 'blockchain' ||
    currentStep === 'database_tx'
  ) {
    return (
      <TaskProgressStep
        currentStep={currentStep}
        isCreating={isCreating || isPending}
        createSuccess={createSuccess}
        createTx={createTx}
        createError={createError}
      />
    )
  }

  // Formulário principal
  return (
    <NetworkGuard>
      <TaskFormStep
        form={form}
        costs={costs}
        errors={state.errors}
        isConnected={isConnected}
        isSubmitting={isProcessing}
        onSubmit={onSubmit}
      />
    </NetworkGuard>
  )
}
