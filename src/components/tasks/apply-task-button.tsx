'use client'

import { useState } from 'react'
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
import { applyToTask } from '@/actions/developers'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleApply = async () => {
    if (!isConnected || !address) {
      toast.error('Conecte sua carteira para aplicar')
      return
    }

    if (!acceptedTerms) {
      toast.error('Você deve aceitar os termos para aplicar')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await applyToTask(task.id, address)

      if (result.success) {
        toast.success('Aplicação enviada com sucesso!')
        setIsOpen(false)
        router.refresh() // Atualizar a página
      } else {
        toast.error(result.error || 'Erro ao aplicar para a tarefa')
      }
    } catch (error) {
      console.error('Erro ao aplicar:', error)
      toast.error('Erro inesperado ao aplicar')
    } finally {
      setIsSubmitting(false)
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
                    ~$XXX USD {/* TODO: Integrar API de preços */}
                  </div>
                </div>
              </div>

              {/* Prazo */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Prazo de Entrega</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {new Date(task.deadline).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div
                    className={cn(
                      'text-xs',
                      isUrgent ? 'text-red-600' : 'text-muted-foreground',
                    )}
                  >
                    {daysUntilDeadline > 0
                      ? `${daysUntilDeadline} dia${
                          daysUntilDeadline !== 1 ? 's' : ''
                        } restante${daysUntilDeadline !== 1 ? 's' : ''}`
                      : 'Prazo vencido'}
                  </div>
                </div>
              </div>

              {/* Overdue permitido */}
              {task.allowOverdue && (
                <div className="flex items-center gap-2 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div className="text-sm">
                    <span className="font-medium text-yellow-800">
                      Prazo flexível:
                    </span>
                    <span className="text-yellow-700 ml-1">
                      3 dias extras permitidos com desconto de 10% por dia
                    </span>
                  </div>
                </div>
              )}

              {/* Requisitos */}
              {task.requirements && (
                <div className="space-y-2">
                  <Label className="font-medium">Requisitos Técnicos:</Label>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {task.requirements}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conectar Carteira */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Carteira
              </CardTitle>
              <CardDescription>
                Conecte sua carteira para receber o pagamento quando a tarefa
                for concluída
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectWallet
                variant="outline"
                showBalance={true}
                showNetwork={true}
                required={true}
              />
            </CardContent>
          </Card>

          {/* Termos e Condições */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
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
              </div>
            </CardContent>
          </Card>

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
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={!isConnected || !acceptedTerms || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Aplicando...
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
