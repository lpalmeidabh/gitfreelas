import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2 } from 'lucide-react'

interface SuccessApplicationProps {
  onClose: () => void
}

export function SuccessApplication({ onClose }: SuccessApplicationProps) {
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
                  Sua aplicação foi registrada com sucesso. O cliente receberá
                  uma notificação e você será informado sobre a decisão.
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

        <Button onClick={onClose} className="w-full">
          Entendi
        </Button>
      </div>
    </>
  )
}
