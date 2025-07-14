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
import { Wallet, AlertCircle, Clock, Info } from 'lucide-react'
import { WalletConnectButton } from '@/components/web3/wallet-connect-button'
import { CreateTaskInput } from '@/lib/schemas/task'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TaskFormStepProps {
  form: UseFormReturn<CreateTaskInput>
  costs: {
    taskValueEth: string
    platformFeeEth: string
    totalDepositEth: string
  }
  errors?: Record<string, string[] | undefined> | undefined
  isConnected: boolean
  isSubmitting: boolean
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> // ✅ Tipo correto do RHF
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
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Conecte sua carteira para depositar o valor da tarefa
                    </AlertDescription>
                  </Alert>
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
                    {errors?.title && (
                      <p className="text-sm text-red-500">
                        {errors.title.join(', ')}
                      </p>
                    )}
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
                    {errors?.description && (
                      <p className="text-sm text-red-500">
                        {errors.description.join(', ')}
                      </p>
                    )}
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
                        placeholder="Ex: React, TypeScript, Tailwind CSS, responsivo..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {errors?.requirements && (
                      <p className="text-sm text-red-500">
                        {errors.requirements.join(', ')}
                      </p>
                    )}
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
                      Valor em ETH <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        placeholder="0.1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {errors?.valueInEther && (
                      <p className="text-sm text-red-500">
                        {errors.valueInEther.join(', ')}
                      </p>
                    )}

                    {/* Cálculo de custos em tempo real */}
                    {costs.taskValueEth && (
                      <div className="mt-2 p-3 bg-muted rounded-lg space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Valor da tarefa:</span>
                          <span className="font-mono">
                            {costs.taskValueEth} ETH
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Taxa da plataforma (3%):</span>
                          <span className="font-mono">
                            +{costs.platformFeeEth} ETH
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total a depositar:</span>
                          <span className="font-mono">
                            {costs.totalDepositEth} ETH
                          </span>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Deadline */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Data Limite <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={new Date(Date.now() + 24 * 60 * 60 * 1000)
                          .toISOString()
                          .slice(0, 16)}
                        value={field.value?.toISOString().slice(0, 16) || ''}
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    {errors?.deadline && (
                      <p className="text-sm text-red-500">
                        {errors.deadline.join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Mínimo: 24 horas a partir de agora
                    </p>
                  </FormItem>
                )}
              />

              {/* Allow Overdue */}
              <FormField
                control={form.control}
                name="allowOverdue"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Permitir prazo extra (3 dias)</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Desenvolvedor terá 3 dias extras após o prazo, com
                        desconto de 10% do valor por dia
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Botão de submit */}
              <div className="space-y-4">
                {/* Informação importante */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Ao continuar, você irá criar a tarefa no blockchain e
                    depositar o valor. Esta ação é irreversível até que a tarefa
                    seja concluída ou cancelada.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isConnected || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'Processando...' : 'Revisar e Criar Tarefa'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
