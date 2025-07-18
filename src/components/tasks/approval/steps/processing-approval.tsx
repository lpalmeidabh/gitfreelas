'use client'

import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react'
import { ApprovalAction } from '@/hooks/tasks/useApproveTask'

interface ProcessingApprovalProps {
  currentAction: ApprovalAction | null
  onClose: () => void
}

export function ProcessingApproval({
  currentAction,
  onClose,
}: ProcessingApprovalProps) {
  const isAccepting = currentAction === 'accept'
  const isRejecting = currentAction === 'reject'

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {isAccepting ? (
            <ThumbsUp className="h-5 w-5 text-green-600" />
          ) : (
            <ThumbsDown className="h-5 w-5 text-red-600" />
          )}
          {isAccepting ? 'Aceitando Desenvolvedor' : 'Rejeitando Aplicação'}
        </DialogTitle>
        <DialogDescription>
          {isAccepting
            ? 'Processando a aceitação do desenvolvedor...'
            : 'Processando a rejeição da aplicação...'}
        </DialogDescription>
      </DialogHeader>

      <div className="py-8">
        <div className="space-y-6">
          {/* Main Processing Indicator */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-muted flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="font-medium">
                  {isAccepting
                    ? 'Processando aprovação...'
                    : 'Removendo aplicação...'}
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  {isAccepting
                    ? 'Estamos atualizando a blockchain e criando o repositório. Aguarde alguns segundos.'
                    : 'Removendo a aplicação e voltando a tarefa para status "Aberta".'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">⏳ Processando sua decisão</p>
              <p>
                {isAccepting
                  ? 'O desenvolvedor será notificado e poderá começar a trabalhar assim que o processo for concluído.'
                  : 'A tarefa ficará disponível novamente para outras aplicações.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note: No close button during processing */}
      <div className="flex justify-center">
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ Não feche esta janela durante o processamento
        </p>
      </div>
    </>
  )
}
