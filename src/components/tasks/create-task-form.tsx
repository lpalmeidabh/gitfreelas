'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CalendarIcon, Wallet, AlertCircle, Clock } from 'lucide-react'
import { ConnectWallet } from '@/components/web3/connect-wallet'
import { useWallet } from '@/hooks/useWallet'
import { createTask } from '@/actions/tasks'
import { CreateTaskData, CreateTaskErrors } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function CreateTaskForm() {
  const router = useRouter()
  const { isConnected, address } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    requirements: '',
    valueInEther: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de hoje
    allowOverdue: false,
  })

  const [errors, setErrors] = useState<CreateTaskErrors>({})

  // Validações do formulário
  const validateForm = (): boolean => {
    const newErrors: CreateTaskErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Título deve ter no máximo 100 caracteres'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres'
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Descrição deve ter no máximo 2000 caracteres'
    }

    if (formData.requirements && formData.requirements.length > 1000) {
      newErrors.requirements = 'Requisitos devem ter no máximo 1000 caracteres'
    }

    const valueNum = parseFloat(formData.valueInEther)
    if (!formData.valueInEther || isNaN(valueNum)) {
      newErrors.valueInEther = 'Valor é obrigatório'
    } else if (valueNum < 0.001) {
      newErrors.valueInEther = 'Valor mínimo é 0.001 ETH'
    } else if (valueNum > 100) {
      newErrors.valueInEther = 'Valor máximo é 100 ETH'
    }

    const now = new Date()
    const minDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 dia
    if (formData.deadline < minDeadline) {
      newErrors.deadline = 'Prazo deve ser pelo menos 1 dia a partir de agora'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error('Conecte sua carteira para criar uma tarefa')
      return
    }

    if (!validateForm()) {
      toast.error('Corrija os erros no formulário')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createTask(formData)

      if (result.success && result.task) {
        toast.success('Tarefa criada com sucesso!')
        router.push(`/tasks/${result.task.id}`)
      } else {
        toast.error(result.error || 'Erro ao criar tarefa')
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      toast.error('Erro inesperado ao criar tarefa')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    setFormData((prev) => ({ ...prev, deadline: date }))
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
  }

  const calculatePlatformFee = () => {
    const value = parseFloat(formData.valueInEther)
    if (isNaN(value)) return '0'
    return (value * 0.03).toFixed(4) // 3% de taxa
  }

  const calculateTotal = () => {
    const value = parseFloat(formData.valueInEther)
    if (isNaN(value)) return '0'
    return (value * 1.03).toFixed(4) // Valor + 3% de taxa
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Criar Nova Tarefa
          </CardTitle>
          <CardDescription>
            Descreva sua tarefa e aguarde desenvolvedores se aplicarem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Conexão da Carteira */}
            <div className="space-y-2">
              <Label>Carteira</Label>
              <ConnectWallet
                variant="outline"
                showBalance={true}
                showNetwork={true}
                required={true}
              />
              {!isConnected && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Conecte sua carteira para depositar o valor da tarefa
                </p>
              )}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título da Tarefa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ex: Desenvolver landing page responsiva"
                className={cn(errors.title && 'border-red-500')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 caracteres
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descreva detalhadamente o que precisa ser desenvolvido..."
                rows={5}
                className={cn(errors.description && 'border-red-500')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/2000 caracteres
              </p>
            </div>

            {/* Requisitos */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos Técnicos</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requirements: e.target.value,
                  }))
                }
                placeholder="Tecnologias específicas, frameworks, etc. (opcional)"
                rows={3}
                className={cn(errors.requirements && 'border-red-500')}
              />
              {errors.requirements && (
                <p className="text-sm text-red-500">{errors.requirements}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.requirements?.length || 0}/1000 caracteres
              </p>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="value">
                Valor em ETH <span className="text-red-500">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                step="0.001"
                min="0.001"
                max="100"
                value={formData.valueInEther}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    valueInEther: e.target.value,
                  }))
                }
                placeholder="0.1"
                className={cn(errors.valueInEther && 'border-red-500')}
              />
              {errors.valueInEther && (
                <p className="text-sm text-red-500">{errors.valueInEther}</p>
              )}

              {/* Resumo de valores */}
              {formData.valueInEther &&
                !isNaN(parseFloat(formData.valueInEther)) && (
                  <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Valor da tarefa:</span>
                      <span>{formData.valueInEther} ETH</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxa da plataforma (3%):</span>
                      <span>{calculatePlatformFee()} ETH</span>
                    </div>
                    <hr className="my-1" />
                    <div className="flex justify-between font-medium">
                      <span>Total a depositar:</span>
                      <span>{calculateTotal()} ETH</span>
                    </div>
                  </div>
                )}
            </div>

            {/* Prazo */}
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Prazo de Entrega <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formatDateForInput(formData.deadline)}
                onChange={handleDateChange}
                className={cn(errors.deadline && 'border-red-500')}
              />
              {errors.deadline && (
                <p className="text-sm text-red-500">{errors.deadline}</p>
              )}
            </div>

            {/* Allow Overdue */}
            <div className="flex items-start space-x-3 p-3 border rounded-md">
              <Checkbox
                id="allowOverdue"
                checked={formData.allowOverdue}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, allowOverdue: !!checked }))
                }
              />
              <div className="space-y-1">
                <Label
                  htmlFor="allowOverdue"
                  className="font-medium flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Permitir prazo extra
                </Label>
                <p className="text-sm text-muted-foreground">
                  Permite 3 dias extras após o vencimento, com desconto de 10%
                  por dia de atraso
                </p>
              </div>
            </div>

            {/* Botão Submit */}
            <Button
              type="submit"
              disabled={!isConnected || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Criando Tarefa...
                </>
              ) : (
                'Criar Tarefa e Depositar Valor'
              )}
            </Button>

            {!isConnected && (
              <p className="text-center text-sm text-muted-foreground">
                Conecte sua carteira para continuar
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
