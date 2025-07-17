import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, X } from 'lucide-react'

interface ErrorApplicationProps {
  errorMessage?: string
  onRetry: () => void
  onClose: () => void
}

export function ErrorApplication({
  errorMessage,
  onRetry,
  onClose,
}: ErrorApplicationProps) {
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
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          <Button onClick={onRetry} className="flex-1">
            Tentar Novamente
          </Button>
        </div>
      </div>
    </>
  )
}
