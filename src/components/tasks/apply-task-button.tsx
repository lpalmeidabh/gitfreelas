'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConnectWallet } from '@/components/web3/connect-wallet'
import { useWallet } from '@/hooks/useWallet'
import { useApplyToTask } from '@/hooks/tasks/useApplyToTask'
import { TaskWithRelations } from '@/types'
import { weiToEther } from '@/lib/web3/config'
import {
  Wallet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ApplyTaskButtonProps {
  task: TaskWithRelations
  currentUserId?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  disabled?: boolean
}

export function ApplyTaskButton({
  task,
  currentUserId,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
}: ApplyTaskButtonProps) {
  const router = useRouter()
  const { isConnected, address } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Usar o hook useApplyToTask
  const {
    currentStep,
    isApplying,
    isSubmittingToDb,
    hasError,
    errorMessage,
    state,
    applyToTask,
    submitToDatabase,
    resetOnError,
  } = useApplyToTask()

  // Verificações de elegibilidade
  const isOwner = currentUserId === task.creatorId
  const hasAppliedDeveloper = !!task.taskDeveloper
  const isTaskOpen = task.status === 'OPEN'
  const canApply = isTaskOpen && !isOwner && !hasAppliedDeveloper && !disabled

  // Calcular informações da tarefa
  const valueInEth = weiToEther(task.valueInWei)
  const formattedValue = parseFloat(valueInEth).toFixed(4)

  const daysUntilDeadline = Math.ceil(
    (new Date(task.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  )

  const isUrgent = daysUntilDeadline <= 2 && daysUntilDeadline > 0

  // Efeitos para gerenciar o fluxo
  useEffect(() => {
    if (currentStep === 'blockchain' && isApplying) {
      toast.loading('Enviando aplicação para o contrato...', {
        id: 'apply-loading',
      })
    }
  }, [currentStep, isApplying])

  useEffect(() => {
    if (currentStep === 'database' && isSubmittingToDb) {
      toast.loading('Salvando aplicação no banco...', { id: 'apply-loading' })
    }
  }, [currentStep, isSubmittingToDb])

  useEffect(() => {
    if (state.success) {
      toast.dismiss('apply-loading')
      toast.success('Aplicação enviada com sucesso!')
      setIsOpen(false)
      router.refresh()
    }
  }, [state.success, router])

  useEffect(() => {
    if (hasError) {
      toast.dismiss('apply-loading')
      toast.error(errorMessage || 'Erro ao aplicar para a tarefa')
    }
  }, [hasError, errorMessage])

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
      // Iniciar processo de aplicação (Web3 + Server Action)
      await applyToTask(task.id)
    } catch (error) {
      console.error('Erro ao aplicar:', error)
      toast.error('Erro inesperado ao aplicar')
    }
  }

  // Se não pode aplicar, retorna botão desabilitado com motivo
  if (!canApply) {
    let reason = ''
    if (isOwner) reason = 'Sua tarefa'
    else if (hasAppliedDeveloper) reason = 'Já tem desenvolvedor'
    else if (!isTaskOpen) reason = 'Não disponível'
    else if (disabled) reason = 'Indisponível'

    return (
      <Button
        variant="outline"
        size={size}
        className={cn(className, 'cursor-not-allowed')}
        disabled
      >
        {reason}
      </Button>
    )
  }

  const isProcessing = isApplying || isSubmittingToDb

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={cn(className)}>
          <User className="h-4 w-4 mr-2" />
          Aplicar para Tarefa
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Aplicar para Tarefa
          </DialogTitle>
          <DialogDescription>
            Revise os detalhes da tarefa e conecte sua carteira para aplicar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Tarefa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <CardDescription className="line-clamp-3">
                {task.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Valor */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Valor da Tarefa</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{formattedValue} ETH</div>
                  <div className="text-xs text-muted-foreground">
                    ~$XXX USD {/* TODO: Integrar cotação */}
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Prazo de Entrega</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {task.deadline.toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {daysUntilDeadline} dia{daysUntilDeadline !== 1 ? 's' : ''}{' '}
                    restante
                    {daysUntilDeadline !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Overdue */}
              {task.allowOverdue && (
                <div className="flex items-center gap-2 p-3 border border-orange-200 bg-orange-50 rounded-md">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div className="text-sm">
                    <span className="font-medium text-orange-800">
                      Prazo extra disponível:
                    </span>
                    <span className="text-orange-700 ml-1">
                      3 dias adicionais (10% desconto por dia)
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conectar Carteira */}
          {!isConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conectar Carteira</CardTitle>
                <CardDescription>
                  Necessário para registrar sua aplicação no contrato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConnectWallet />
              </CardContent>
            </Card>
          )}

          {/* Termos */}
          {isConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Termos e Condições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                  />
                  <div className="space-y-2">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-relaxed cursor-pointer"
                    >
                      Eu aceito os termos e condições desta tarefa
                    </Label>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        • Comprometo-me a entregar a tarefa dentro do prazo
                        estabelecido
                      </p>
                      <p>
                        • Entendo que o repositório será criado automaticamente
                      </p>
                      <p>
                        • O pagamento será liberado apenas após aprovação do
                        cliente
                      </p>
                      <p>• Posso ter apenas uma tarefa ativa por vez</p>
                      {task.allowOverdue && (
                        <p>
                          • Se usar prazo extra, aceito o desconto de 10% por
                          dia de atraso
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Avisos */}
          {isUrgent && (
            <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="text-sm">
                <span className="font-medium text-red-800">
                  Tarefa urgente:
                </span>
                <span className="text-red-700 ml-1">
                  Prazo de entrega em {daysUntilDeadline} dia
                  {daysUntilDeadline !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={!isConnected || !acceptedTerms || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {currentStep === 'blockchain' ? 'Enviando...' : 'Salvando...'}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aplicar Agora
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
