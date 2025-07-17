'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useApplyToTask } from '@/hooks/tasks/useApplyToTask'
import { TaskWithRelations } from '@/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmApplication } from './steps/confirm-application'
import { ErrorApplication } from './steps/error-application'
import { ProcessingApplication } from './steps/processing-application'
import { SuccessApplication } from './steps/success-application'

interface ApplyTaskModalProps {
  task: TaskWithRelations
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function ApplyTaskModal({
  task,
  isOpen,
  onOpenChange,
  onClose,
}: ApplyTaskModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const {
    currentStep,
    isConnected,
    address,
    errorMessage,
    canCloseModal,
    applyToTask,
    resetToInitial,
  } = useApplyToTask()

  // Bloquear fechamento durante processamento
  const handleOpenChange = (open: boolean) => {
    if (!open && !canCloseModal) {
      return // Impedir fechamento durante processamento
    }
    // REMOVER esta linha que estava fechando automaticamente:
    // onOpenChange(open)

    // Só permitir fechar se for manualmente pelo usuário
    if (open === false && canCloseModal) {
      onOpenChange(open)
    } else if (open === true) {
      onOpenChange(open)
    }
  }

  // Handler para aplicar
  const handleApply = async () => {
    if (!isConnected || !address) {
      toast.error('Conecte sua carteira para aplicar')
      return
    }

    if (!acceptedTerms) {
      toast.error('Você deve aceitar os termos para aplicar')
      return
    }

    try {
      await applyToTask(task.id)
    } catch (error) {
      console.error('Erro ao aplicar:', error)
    }
  }

  // Handler para fechar modal
  const handleClose = () => {
    setAcceptedTerms(false)
    resetToInitial()
    onClose()
  }

  // Handler para tentar novamente
  const handleRetry = () => {
    setAcceptedTerms(false)
    resetToInitial()
  }

  // Renderizar conteúdo baseado no step
  const renderContent = () => {
    switch (currentStep) {
      case 'confirm':
        return (
          <ConfirmApplication
            task={task}
            isConnected={isConnected}
            address={address}
            acceptedTerms={acceptedTerms}
            onAcceptedTermsChange={setAcceptedTerms}
            onApply={handleApply}
            onCancel={handleClose}
          />
        )

      case 'signing':
      case 'submitting':
        return <ProcessingApplication currentStep={currentStep} />

      case 'success':
        return <SuccessApplication onClose={handleClose} />

      case 'error':
        return (
          <ErrorApplication
            errorMessage={errorMessage}
            onRetry={handleRetry}
            onClose={handleClose}
          />
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
