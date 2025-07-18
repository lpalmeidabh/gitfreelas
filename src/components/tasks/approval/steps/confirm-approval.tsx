'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  Clock,
  ThumbsDown,
  ThumbsUp,
  User as UserIcon,
  Wallet,
} from 'lucide-react'
import { TaskWithRelations } from '@/types'
import { formatTimeDistance } from '@/lib/date-utils'
import { DeveloperProfileCard } from '@/components/developer-profile-card'

interface ConfirmApprovalProps {
  task: TaskWithRelations
  isConnected: boolean
  onAccept: () => void
  onReject: () => void
  onClose: () => void
}

export function ConfirmApproval({
  task,
  isConnected,
  onAccept,
  onReject,
  onClose,
}: ConfirmApprovalProps) {
  // Verificar se há desenvolvedor aplicado
  if (!task.taskDeveloper) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Nenhuma Aplicação
          </DialogTitle>
          <DialogDescription>
            Nenhum desenvolvedor aplicado para esta tarefa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </>
    )
  }

  const developer = task.taskDeveloper.developer

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Revisar Aplicação
        </DialogTitle>
        <DialogDescription>
          Revise as informações do desenvolvedor e decida sobre a aplicação
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Developer Profile Card - USANDO HELPER */}
        <DeveloperProfileCard
          developer={developer}
          walletAddress={task.taskDeveloper.walletAddress}
          appliedAt={task.taskDeveloper.appliedAt}
        />

        {/* Connection Warning */}
        {!isConnected && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">
                  Carteira Desconectada
                </p>
                <p className="text-sm text-yellow-700">
                  Conecte sua carteira para aceitar ou rejeitar esta aplicação
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Decisão</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aceite o desenvolvedor para iniciar o projeto ou rejeite para
              receber novas aplicações
            </p>

            <div className="flex gap-3">
              <Button
                onClick={onAccept}
                disabled={!isConnected}
                className="flex-1"
                size="lg"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Aceitar Desenvolvedor
              </Button>

              <Button
                onClick={onReject}
                disabled={!isConnected}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Rejeitar Aplicação
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Aceitar:</strong> Um repositório GitHub será criado
              automaticamente e o desenvolvedor poderá começar a trabalhar.
            </p>
            <p>
              <strong>Rejeitar:</strong> A tarefa voltará para o status "Aberta"
              para receber novas aplicações.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={onClose} variant="outline">
          Cancelar
        </Button>
      </div>
    </>
  )
}
