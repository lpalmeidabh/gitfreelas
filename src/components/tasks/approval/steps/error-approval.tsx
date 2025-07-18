'use client'

import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react'

interface ErrorApprovalProps {
  errorMessage?: string
  onRetry: () => void
  onClose: () => void
}

export function ErrorApproval({
  errorMessage,
  onRetry,
  onClose,
}: ErrorApprovalProps) {
  const handleReload = () => {
    window.location.reload()
  }

  // Categorizar erro para mostrar mensagem apropriada
  const getErrorInfo = () => {
    if (!errorMessage) {
      return {
        title: 'Erro Desconhecido',
        description: 'Ocorreu um erro inesperado durante a operação.',
        isRetryable: true,
      }
    }

    const message = errorMessage.toLowerCase()

    if (message.includes('carteira') || message.includes('wallet')) {
      return {
        title: 'Erro de Carteira',
        description:
          'Problema com a conexão da carteira ou transação rejeitada.',
        isRetryable: true,
      }
    }

    if (message.includes('rede') || message.includes('network')) {
      return {
        title: 'Erro de Rede',
        description: 'Problema de conectividade com a blockchain ou servidor.',
        isRetryable: true,
      }
    }

    if (message.includes('permissão') || message.includes('permission')) {
      return {
        title: 'Sem Permissão',
        description: 'Você não tem permissão para realizar esta operação.',
        isRetryable: false,
      }
    }

    if (message.includes('não encontrada') || message.includes('not found')) {
      return {
        title: 'Recurso Não Encontrado',
        description: 'A tarefa ou aplicação não foi encontrada.',
        isRetryable: false,
      }
    }

    return {
      title: 'Erro na Operação',
      description: 'Ocorreu um erro durante o processamento da operação.',
      isRetryable: true,
    }
  }

  const errorInfo = getErrorInfo()

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600" />
          {errorInfo.title}
        </DialogTitle>
        <DialogDescription>{errorInfo.description}</DialogDescription>
      </DialogHeader>

      <div className="py-6">
        <div className="space-y-6">
          {/* Error Icon and Message */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-red-900">
                  Algo deu errado
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Não foi possível completar a operação. Veja os detalhes abaixo
                  e tente novamente.
                </p>
              </div>
            </div>
          </div>

          {/* Error Details */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-900 mb-2">
                  Detalhes do Erro
                </p>
                <p className="text-sm text-red-700 break-words">
                  {errorMessage || 'Erro desconhecido durante a operação.'}
                </p>
              </div>
            </div>
          </div>

          {/* Troubleshooting Tips */}
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Possíveis Soluções
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span>
                  Verifique se sua carteira está conectada e desbloqueada
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span>Confirme se você tem permissão para esta operação</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span>Verifique sua conexão com a internet</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span>Tente recarregar a página se o problema persistir</span>
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Precisa de ajuda?</p>
              <p>
                Se o problema continuar, entre em contato com o suporte ou
                verifique se há atualizações do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>

        {errorInfo.isRetryable && (
          <Button onClick={onRetry} variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        )}

        <Button onClick={handleReload}>Recarregar Página</Button>
      </div>
    </>
  )
}
