'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface TaskProgressStepProps {
  currentStep: 'blockchain' | 'database'
  isCreating: boolean
  createSuccess: boolean
  createTx?: string
  createError?: Error | null
}

export function TaskProgressStep({
  currentStep,
  isCreating,
  createSuccess,
  createTx,
  createError,
}: TaskProgressStepProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Criando Tarefa...</CardTitle>
          <CardDescription>Processando sua transação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  createSuccess
                    ? 'bg-green-500'
                    : isCreating
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              >
                {createSuccess ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : isCreating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-white text-sm">1</span>
                )}
              </div>
              <div>
                <div className="font-medium">Transação no Contrato</div>
                <div className="text-sm text-muted-foreground">
                  {createSuccess
                    ? 'Confirmada na blockchain'
                    : isCreating
                    ? 'Aguardando confirmação...'
                    : 'Pendente'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'database' ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                {currentStep === 'database' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-white text-sm">2</span>
                )}
              </div>
              <div>
                <div className="font-medium">Salvando no Banco</div>
                <div className="text-sm text-muted-foreground">
                  {currentStep === 'database'
                    ? 'Salvando dados...'
                    : 'Aguardando'}
                </div>
              </div>
            </div>
          </div>

          {createTx && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Hash da transação:</strong>
                <br />
                <code className="text-xs break-all">{createTx}</code>
              </AlertDescription>
            </Alert>
          )}

          {createError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erro:</strong> {createError.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
