'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useApproveTask } from '@/hooks/tasks/useApproveTask'
import { TaskWithRelations } from '@/types'
import { ConfirmApproval } from './steps/confirm-approval'
import { ProcessingApproval } from './steps/processing-approval'
import { SuccessApproval } from './steps/success-approval'
import { ErrorApproval } from './steps/error-approval'
import { SuccessNotification } from './success-notification'

interface TaskApprovalModalProps {
  task: TaskWithRelations
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function TaskApprovalModal({
  task,
  isOpen,
  onOpenChange,
  onClose,
}: TaskApprovalModalProps) {
  const {
    currentStep,
    currentAction,
    isConnected,
    address,
    acceptDeveloper,
    rejectDeveloper,
    errorMessage,
    canCloseModal,
    resetToInitial,
    isSuccess,
  } = useApproveTask()

  // Bloquear fechamento durante processamento
  const handleOpenChange = (open: boolean) => {
    if (!open && !canCloseModal) {
      return // Impedir fechamento durante processamento
    }

    if (open === false && canCloseModal) {
      onOpenChange(open)
    } else if (open === true) {
      onOpenChange(open)
    }
  }

  // Handler para aceitar desenvolvedor
  const handleAccept = async () => {
    if (!isConnected || !address) {
      return
    }

    if (!task.taskDeveloper) {
      return
    }

    try {
      await acceptDeveloper(task.id, task.taskDeveloper.walletAddress)
    } catch (error) {
      console.error('Erro ao aceitar:', error)
    }
  }

  // Handler para rejeitar aplicação
  const handleReject = async () => {
    try {
      await rejectDeveloper(task.id)
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
    }
  }

  // Handler para fechar modal
  const handleClose = () => {
    resetToInitial()
    onClose()
  }

  // Handler para tentar novamente
  const handleRetry = () => {
    resetToInitial()
  }

  // Renderizar conteúdo baseado no step
  const renderContent = () => {
    switch (currentStep) {
      case 'confirm':
        return (
          <ConfirmApproval
            task={task}
            isConnected={isConnected}
            onAccept={handleAccept}
            onReject={handleReject}
            onClose={handleClose}
          />
        )

      case 'processing':
        return (
          <ProcessingApproval
            currentAction={currentAction}
            onClose={handleClose}
          />
        )

      case 'success':
        return (
          <SuccessApproval
            currentAction={currentAction}
            onClose={handleClose}
          />
        )

      case 'error':
        return (
          <ErrorApproval
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
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          {renderContent()}
        </DialogContent>
      </Dialog>

      {/* Fallback notification if modal closes too quickly */}
      {isSuccess && !isOpen && (
        <SuccessNotification
          message={
            currentAction === 'accept'
              ? 'Desenvolvedor aprovado com sucesso!'
              : 'Aplicação rejeitada com sucesso!'
          }
          details={
            currentAction === 'accept'
              ? 'Repositório criado e desenvolvedor adicionado como colaborador.'
              : 'A tarefa voltou para o status "Aberta" para receber novas aplicações.'
          }
          onClose={() => resetToInitial()}
        />
      )}
    </>
  )
}
