import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ConnectWallet } from '@/components/web3/connect-wallet'
import { TaskSummaryCard } from '../task-summary-card'
import { TaskWithRelations } from '@/types'
import { User } from 'lucide-react'

interface ConfirmApplicationProps {
  task: TaskWithRelations
  isConnected: boolean
  address?: string
  acceptedTerms: boolean
  onAcceptedTermsChange: (accepted: boolean) => void
  onApply: () => void
  onCancel: () => void
}

export function ConfirmApplication({
  task,
  isConnected,
  address,
  acceptedTerms,
  onAcceptedTermsChange,
  onApply,
  onCancel,
}: ConfirmApplicationProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Aplicar para Tarefa
        </DialogTitle>
        <DialogDescription>
          Revise os detalhes da tarefa antes de aplicar
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Resumo da Tarefa */}
        <TaskSummaryCard
          task={task}
          address={address}
          isConnected={isConnected}
        />

        {/* Termos */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) =>
              onAcceptedTermsChange(checked === true)
            }
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed">
            Aceito os termos e condições. Entendo que minha aplicação será
            analisada pelo cliente e que apenas após aprovação poderei iniciar o
            trabalho.
          </Label>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          {isConnected ? (
            <Button
              onClick={onApply}
              disabled={!acceptedTerms}
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              Aplicar para Tarefa
            </Button>
          ) : (
            <div className="flex-1">
              <ConnectWallet className="w-full" />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
