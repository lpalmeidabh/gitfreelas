'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ConnectWallet } from '@/components/web3/connect-wallet'
import { useApplyToTask } from '@/hooks/tasks/useApplyToTask'
import { useWallet } from '@/hooks/useWallet'
import { cn } from '@/lib/utils'
import { weiToEther } from '@/lib/web3/config'
import { TaskWithRelations } from '@/types'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Database,
  Loader2,
  PenTool,
  User,
  Wallet,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
    isProcessing,
    isSigning,
    isSubmitting,
    hasError,
    errorMessage,
    state,
    applyToTask,
    handleClose,
    resetOnError,
    canCloseModal,
    isComplete,
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

  // Bloquear fechamento do modal durante processamento
  const handleOpenChange = (open: boolean) => {
    // NUNCA permitir fechar exceto por botões específicos
    if (!open) {
      return // Impedir qualquer tentativa de fechar
    }
    setIsOpen(open)
  }

  useEffect(() => {
    console.log('TaskDetailsPage mounted')
  }, [])

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

  // Handler para fechar e refresh
  const handleCloseAndRefresh = () => {
    setIsOpen(false)
    setAcceptedTerms(false)
    handleClose()
  }

  // Se não pode aplicar, retorna botão desabilitado
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

  // Renderizar conteúdo do modal baseado no step
  const renderModalContent = () => {
    // Step 1: Confirmação inicial
    if (currentStep === 'confirm') {
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Valor */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Valor</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formattedValue} ETH
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ≈ ${(parseFloat(formattedValue) * 2000).toFixed(2)} USD
                    </div>
                  </div>
                </div>

                {/* Prazo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Prazo</span>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'font-bold',
                        isUrgent ? 'text-orange-600' : 'text-blue-600',
                      )}
                    >
                      {daysUntilDeadline} dias
                    </div>
                    {isUrgent && (
                      <div className="text-xs text-orange-600">Urgente!</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status da carteira */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-medium">Carteira</span>
                  </div>
                  {isConnected ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Conectada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Desconectada
                    </Badge>
                  )}
                </div>
                {isConnected && address && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Termos */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                Aceito os termos e condições. Entendo que minha aplicação será
                analisada pelo cliente e que apenas após aprovação poderei
                iniciar o trabalho.
              </Label>
            </div>

            {/* Conectar carteira ou aplicar */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              {isConnected ? (
                <Button
                  onClick={handleApply}
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

    // Steps de processamento
    if (currentStep === 'signing' || currentStep === 'submitting') {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processando Aplicação
            </DialogTitle>
            <DialogDescription>
              Aguarde enquanto processamos sua aplicação...
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {/* Step 1: Assinatura */}
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  currentStep === 'signing'
                    ? 'bg-blue-50 border-blue-200'
                    : getStepStatus('signing') === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-muted/50',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full',
                    currentStep === 'signing'
                      ? 'bg-blue-600 text-white'
                      : getStepStatus('signing') === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {currentStep === 'signing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : getStepStatus('signing') === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <PenTool className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">Assinatura da Carteira</p>
                  <p className="text-xs text-muted-foreground">
                    {currentStep === 'signing'
                      ? 'Aguardando assinatura...'
                      : getStepStatus('signing') === 'completed'
                      ? 'Assinatura confirmada'
                      : 'Verificar identidade da carteira'}
                  </p>
                </div>
              </div>

              {/* Step 2: Banco de dados */}
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  currentStep === 'submitting'
                    ? 'bg-blue-50 border-blue-200'
                    : getStepStatus('submitting') === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-muted/50',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full',
                    currentStep === 'submitting'
                      ? 'bg-blue-600 text-white'
                      : getStepStatus('submitting') === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {currentStep === 'submitting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : getStepStatus('submitting') === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">Salvando Aplicação</p>
                  <p className="text-xs text-muted-foreground">
                    {currentStep === 'submitting'
                      ? 'Salvando no banco de dados...'
                      : getStepStatus('submitting') === 'completed'
                      ? 'Aplicação salva com sucesso'
                      : 'Registrar aplicação no sistema'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )
    }

    // Step de sucesso
    if (currentStep === 'success') {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Aplicação Concluída
            </DialogTitle>
            <DialogDescription>
              Sua aplicação foi enviada com sucesso!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                  <div>
                    <h3 className="font-medium text-green-900 text-lg">
                      Aplicação Enviada com Sucesso!
                    </h3>
                    <p className="text-sm text-green-700 mt-2">
                      Sua aplicação foi registrada com sucesso. O cliente
                      receberá uma notificação e você será informado sobre a
                      decisão.
                    </p>
                  </div>

                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-xs text-green-800">
                      <strong>Próximos passos:</strong>
                      <br />
                      • Aguarde a análise do cliente
                      <br />
                      • Você receberá uma notificação com a decisão
                      <br />• Se aprovado, poderá iniciar o trabalho
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleCloseAndRefresh} className="w-full">
              Entendi
            </Button>
          </div>
        </>
      )
    }

    // Step de erro
    if (currentStep === 'error') {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Erro na Aplicação
            </DialogTitle>
            <DialogDescription>
              Ocorreu um erro ao processar sua aplicação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertTriangle className="h-16 w-16 text-red-600 mx-auto" />
                  <div>
                    <h3 className="font-medium text-red-900 text-lg">
                      Erro ao Enviar Aplicação
                    </h3>
                    <p className="text-sm text-red-700 mt-2">
                      {errorMessage ||
                        'Ocorreu um erro inesperado. Tente novamente.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  resetOnError()
                  setAcceptedTerms(false)
                }}
                className="flex-1"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </>
      )
    }
  }

  // Helper functions
  const getProgressPercentage = () => {
    switch (currentStep) {
      case 'confirm':
        return 0
      case 'signing':
        return 50
      case 'submitting':
        return 85
      case 'success':
        return 100
      default:
        return 0
    }
  }

  const getStepStatus = (step: string) => {
    const steps = ['signing', 'submitting']
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={cn(className)}>
          <User className="h-4 w-4 mr-2" />
          Aplicar para Tarefa
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => e.preventDefault()} // SEMPRE impedir ESC
        onPointerDownOutside={(e) => e.preventDefault()} // SEMPRE impedir click fora
        onInteractOutside={(e) => e.preventDefault()} // ADICIONAR esta linha também
      >
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  )
}
