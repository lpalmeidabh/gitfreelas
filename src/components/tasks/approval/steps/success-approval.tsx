'use client'

import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  ExternalLink,
  Github,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { ApprovalAction } from '@/hooks/tasks/useApproveTask'

interface SuccessApprovalProps {
  currentAction: ApprovalAction | null
  onClose: () => void
  repositoryUrl?: string
}

export function SuccessApproval({
  currentAction,
  onClose,
  repositoryUrl,
}: SuccessApprovalProps) {
  const isAccepted = currentAction === 'accept'
  const isRejected = currentAction === 'reject'

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          {isAccepted ? 'Desenvolvedor Aceito!' : 'Aplicação Rejeitada!'}
        </DialogTitle>
        <DialogDescription>
          {isAccepted
            ? 'O desenvolvedor foi aceito e pode começar a trabalhar.'
            : 'A aplicação foi rejeitada e a tarefa voltou para o status "Aberta".'}
        </DialogDescription>
      </DialogHeader>

      <div className="py-6">
        <div className="space-y-6">
          {/* Success Icon and Message */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                {isAccepted ? (
                  <ThumbsUp className="h-10 w-10 text-green-600" />
                ) : (
                  <ThumbsDown className="h-10 w-10 text-red-600" />
                )}
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  {isAccepted ? 'Tudo Pronto!' : 'Aplicação Removida!'}
                </h3>
                <p className="text-muted-foreground">
                  {isAccepted
                    ? 'O desenvolvedor já pode começar a trabalhar no projeto.'
                    : 'A tarefa está novamente disponível para aplicações.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action-specific content */}
          {isAccepted && (
            <div className="space-y-4">
              {/* Repository Created */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <Github className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">
                      Repositório Criado
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Um repositório GitHub foi criado automaticamente e o
                      desenvolvedor foi adicionado como colaborador.
                    </p>
                    {repositoryUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => window.open(repositoryUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Repositório
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-3">📋 Próximos Passos</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>O desenvolvedor receberá acesso ao repositório</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>
                      O desenvolvimento pode ser acompanhado via GitHub
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>
                      Você será notificado quando o trabalho for entregue
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="space-y-4">
              {/* Application Removed */}
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-start gap-3">
                  <ThumbsDown className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900">
                      Aplicação Removida
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      A aplicação foi rejeitada e removida do sistema. A tarefa
                      está novamente disponível para receber novas aplicações.
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-3">📋 Próximos Passos</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>A tarefa voltou para o status "Aberta"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Novos desenvolvedores podem se aplicar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Você será notificado sobre novas aplicações</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>
        <Button onClick={handleReload}>Atualizar Página</Button>
      </div>
    </>
  )
}
