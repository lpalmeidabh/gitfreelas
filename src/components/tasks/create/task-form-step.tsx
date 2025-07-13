'use client'

import { UseFormReturn } from 'react-hook-form'
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
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { Wallet, AlertCircle, Clock } from 'lucide-react'
import { WalletConnectButton } from '@/components/web3/wallet-connect-button'
import { CreateTaskInput } from '@/lib/schemas/task'

interface TaskFormStepProps {
  form: UseFormReturn<CreateTaskInput>
  costs: {
    taskValueEth: string
    platformFeeEth: string
    totalDepositEth: string
  }
  errors?: Record<string, string[] | undefined> | undefined // ✅ Tipo correto do Zod
  isConnected: boolean
  isSubmitting: boolean
  onSubmit: () => void
}

export function TaskFormStep({
  form,
  costs,
  errors,
  isConnected,
  isSubmitting,
  onSubmit,
}: TaskFormStepProps) {
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
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Conexão da Carteira */}
              <div className="space-y-2">
                <Label>Carteira</Label>
                <WalletConnectButton />
                {!isConnected && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Conecte sua carteira para depositar o valor da tarefa
                  </p>
                )}
              </div>

              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Título da Tarefa <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Desenvolver landing page responsiva"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/100 caracteres
                    </p>
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descrição <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente o que precisa ser desenvolvido..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/2000 caracteres
                    </p>
                  </FormItem>
                )}
              />

              {/* Requisitos */}
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requisitos Técnicos</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tecnologias específicas, frameworks, etc..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/1000 caracteres
                    </p>
                  </FormItem>
                )}
              />

              {/* Valor */}
              <FormField
                control={form.control}
                name="valueInEther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Valor da Tarefa (ETH){' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="Mínimo: 0.001 ETH"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />

                    {/* Preview de custos */}
                    {field.value && !isNaN(parseFloat(field.value)) && (
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span>Valor da tarefa:</span>
                          <span>{costs.taskValueEth} ETH</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span>Taxa da plataforma (3%):</span>
                          <span>{costs.platformFeeEth} ETH</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between items-center font-medium">
                          <span>Total a depositar:</span>
                          <span className="text-green-600">
                            {costs.totalDepositEth} ETH
                          </span>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Prazo */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Prazo de Entrega <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={
                          field.value
                            ? field.value.toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Allow Overdue */}
              <FormField
                control={form.control}
                name="allowOverdue"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 p-3 border rounded-md">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Permitir prazo extra
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Permite 3 dias extras após o vencimento, com desconto de
                        10% por dia de atraso
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Erros da server action */}
              {errors && Object.keys(errors).length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    Corrija os seguintes erros:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(errors).map(
                      ([field, messages]) =>
                        messages && ( // ✅ Verificar se messages existe
                          <li key={field}>
                            <strong>{field}:</strong> {messages.join(', ')}
                          </li>
                        ),
                    )}
                  </ul>
                </div>
              )}

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
                    Processando...
                  </>
                ) : (
                  'Revisar e Criar Tarefa'
                )}
              </Button>

              {!isConnected && (
                <p className="text-center text-sm text-muted-foreground">
                  Conecte sua carteira para continuar
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
