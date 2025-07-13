import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),

  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),

  requirements: z
    .string()
    .max(1000, 'Requisitos devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),

  valueInEther: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), 'Valor deve ser um número')
    .refine((val) => parseFloat(val) >= 0.001, 'Valor mínimo é 0.001 ETH')
    .refine((val) => parseFloat(val) <= 100, 'Valor máximo é 100 ETH'),

  deadline: z
    .date()
    .refine(
      (date) => date > new Date(Date.now() + 24 * 60 * 60 * 1000),
      'Prazo deve ser pelo menos 1 dia a partir de agora',
    ),

  allowOverdue: z.boolean(),

  // Campos Web3 (preenchidos após transação)
  contractTxHash: z.string().optional(),
  walletAddress: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

// Schema para FormData (strings vindas do form)
export const createTaskFormSchema = z
  .object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    requirements: z.string().max(1000).optional(),
    valueInEther: z.string().refine((val) => !isNaN(parseFloat(val))),
    deadline: z.string().transform((str) => new Date(str)),
    allowOverdue: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    contractTxHash: z.string().optional(),
    walletAddress: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    allowOverdue: data.allowOverdue || false,
    requirements: data.requirements || undefined,
  }))
