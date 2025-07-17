'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CreateTaskData } from '@/types'

interface TaskConfirmationStepProps {
  formData: CreateTaskData
  costs: {
    taskValueEth: string
    platformFeeEth: string
    totalDepositEth: string
  }
  platformFee: number
  isSubmitting: boolean
  onBack: () => void
  onConfirm: () => void
}

export function TaskConfirmationStep({
  formData,
  costs,
  platformFee,
  isSubmitting,
  onBack,
  onConfirm,
}: TaskConfirmationStepProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Confirmar Criação da Tarefa</CardTitle>
          <CardDescription>
            Revise os detalhes antes de enviar para o contrato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumo da tarefa */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Título</Label>
              <p className="text-sm">{formData.title}</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Descrição</Label>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {formData.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Valor da Tarefa</Label>
                <p className="text-lg font-bold">{costs.taskValueEth} ETH</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Prazo</Label>
                <p className="text-sm">
                  {formData.deadline.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown de custos */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Breakdown de Custos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Valor da tarefa</span>
                  <span>{costs.taskValueEth} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa da plataforma ({platformFee}%)</span>
                  <span>{costs.platformFeeEth} ETH</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Total a depositar</span>
                  <span>{costs.totalDepositEth} ETH</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Voltar e Editar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1"
            >
              Confirmar e Depositar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
