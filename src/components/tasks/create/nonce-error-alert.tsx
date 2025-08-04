'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, ExternalLink } from 'lucide-react'

interface NonceErrorAlertProps {
  onRetry: () => void
}

export function NonceErrorAlert({ onRetry }: NonceErrorAlertProps) {
  return (
    <Alert className="border-orange-200 bg-orange-50">
      <RefreshCw className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">
        Erro de Nonce Detectado
      </AlertTitle>
      <AlertDescription className="text-orange-700">
        <div className="space-y-3">
          <p>O MetaMask está com um nonce desatualizado. Para resolver:</p>

          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Abra o MetaMask</li>
            <li>Vá em Configurações (⚙️) → Avançado</li>
            <li>Role até "Reset Account"</li>
            <li>Clique em "Reset Account" e confirme</li>
            <li>Volte aqui e tente novamente</li>
          </ol>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={onRetry}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.open(
                  'https://metamask.io/help/getting-started/reset-account/',
                  '_blank',
                )
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Ajuda
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
