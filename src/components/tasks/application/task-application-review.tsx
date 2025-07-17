'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApproveTask } from '@/hooks/tasks/useApproveTask'
import { TaskWithRelations } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  User as UserIcon,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface TaskApplicationReviewProps {
  task: TaskWithRelations
}

export function TaskApplicationReview({ task }: TaskApplicationReviewProps) {
  const [isMounted, setIsMounted] = useState(false)

  const {
    currentStep,
    currentAction,
    isProcessing,
    acceptDeveloper,
    rejectDeveloper,
    hasError,
    errorMessage,
    isSuccess,
    resetOnError,
    resetToInitial,
    isConnected,
  } = useApproveTask()

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    'accept' | 'reject' | null
  >(null)

  // Prevenir hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Verificar se há desenvolvedor aplicado
  if (!task.taskDeveloper) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              Nenhum desenvolvedor aplicado para esta tarefa.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const developer = task.taskDeveloper.developer

  // Handle action confirmation
  const handleActionConfirm = (action: 'accept' | 'reject') => {
    setPendingAction(action)
    setShowConfirmDialog(true)
  }

  // Execute the action after confirmation
  const executeAction = async () => {
    if (!pendingAction) return

    setShowConfirmDialog(false)

    try {
      if (pendingAction === 'accept') {
        await acceptDeveloper(task.id, task.taskDeveloper!.walletAddress)
      } else {
        await rejectDeveloper(task.id)
      }
    } catch (error) {
      console.error('Erro na ação:', error)
    }

    setPendingAction(null)
  }

  // Cancel action
  const cancelAction = () => {
    setShowConfirmDialog(false)
    setPendingAction(null)
  }

  // Reset after error
  const handleRetry = () => {
    resetOnError()
    resetToInitial()
  }

  // Success state
  if (isSuccess) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h3 className="font-medium text-green-900 text-lg">
                {currentAction === 'accept'
                  ? 'Desenvolvedor Aceito!'
                  : 'Aplicação Rejeitada!'}
              </h3>
              <p className="text-sm text-green-700 mt-2">
                {currentAction === 'accept'
                  ? 'O desenvolvedor foi aceito e pode começar a trabalhar. Um repositório GitHub foi criado automaticamente.'
                  : 'A aplicação foi rejeitada e a tarefa voltou para o status "Aberta" para receber novas aplicações.'}
              </p>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Atualizar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (hasError) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-600 mx-auto" />
            <div>
              <h3 className="font-medium text-red-900 text-lg">
                Erro na Operação
              </h3>
              <p className="text-sm text-red-700 mt-2">{errorMessage}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} variant="outline" size="sm">
                Tentar Novamente
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
                size="sm"
              >
                Recarregar Página
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Developer Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Aplicação Recebida
          </CardTitle>
          <CardDescription>
            Revise as informações do desenvolvedor e decida sobre a aplicação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Developer Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={developer.image || undefined}
                alt={developer.name}
              />
              <AvatarFallback className="text-lg">
                {developer.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-lg">{developer.name}</h3>
                <p className="text-muted-foreground">{developer.email}</p>
              </div>

              {/* Wallet Address */}
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {task.taskDeveloper.walletAddress}
                </code>
              </div>

              {/* Application Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Aplicou{' '}
                  {formatDistanceToNow(new Date(task.taskDeveloper.appliedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Status da Aplicação:</span>
                <Badge variant="secondary" className="ml-2">
                  Aguardando Aprovação
                </Badge>
              </div>
              <div>
                <span className="font-medium">Carteira Conectada:</span>
                <Badge variant="outline" className="ml-2">
                  Verificada
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Warning - Protegido contra hydration */}
      {isMounted && !isConnected && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Decisão</CardTitle>
          <CardDescription>
            Aceite o desenvolvedor para iniciar o projeto ou rejeite para
            receber novas aplicações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              onClick={() => handleActionConfirm('accept')}
              disabled={!isMounted || !isConnected || isProcessing}
              className="flex-1"
              size="lg"
            >
              {isProcessing && currentAction === 'accept' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Aceitar Desenvolvedor
                </>
              )}
            </Button>

            <Button
              onClick={() => handleActionConfirm('reject')}
              disabled={!isMounted || !isConnected || isProcessing}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              {isProcessing && currentAction === 'reject' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Rejeitar Aplicação
                </>
              )}
            </Button>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="text-sm">
                  <p className="font-medium">
                    {currentAction === 'accept'
                      ? 'Aceitando desenvolvedor...'
                      : 'Rejeitando aplicação...'}
                  </p>
                  <p className="text-muted-foreground">
                    {currentStep === 'blockchain' &&
                      'Processando transação no blockchain...'}
                    {currentStep === 'database' &&
                      'Criando repositório e atualizando status...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingAction === 'accept' ? (
                <ThumbsUp className="h-5 w-5 text-green-600" />
              ) : (
                <ThumbsDown className="h-5 w-5 text-red-600" />
              )}
              Confirmar {pendingAction === 'accept' ? 'Aceitação' : 'Rejeição'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'accept'
                ? 'Tem certeza que deseja aceitar este desenvolvedor? Um repositório GitHub será criado automaticamente e o desenvolvedor poderá começar a trabalhar.'
                : 'Tem certeza que deseja rejeitar esta aplicação? A tarefa voltará para o status "Aberta" para receber novas aplicações.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={cancelAction} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={executeAction}
              variant={pendingAction === 'accept' ? 'default' : 'destructive'}
            >
              {pendingAction === 'accept'
                ? 'Aceitar Desenvolvedor'
                : 'Rejeitar Aplicação'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
