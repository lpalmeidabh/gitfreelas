'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  TaskStatus,
  TransactionType,
  TransactionStatus,
} from '@/lib/generated/prisma/client'
import { TaskListResponse, TaskWithRelations } from '@/types'
import { createTaskFormSchema } from '@/lib/schemas/task'
import { etherToWei } from '@/lib/web3/config'

// ===== HELPER FUNCTIONS =====

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error('Usuário não autenticado')
  }

  return session.user
}

// ===== TASK ACTIONS =====

export async function createTask(prevState: any, formData: FormData) {
  try {
    // Converter FormData para objeto
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      requirements: (formData.get('requirements') as string) || undefined,
      valueInEther: formData.get('valueInEther') as string,
      deadline: formData.get('deadline') as string,
      allowOverdue: formData.get('allowOverdue') as string,
      walletAddress: (formData.get('walletAddress') as string) || undefined,
    }

    // Validar dados
    const validatedData = createTaskFormSchema.parse(rawData)

    // Verificar autenticação
    const user = await getCurrentUser()

    // Converter para Wei
    const valueInWei = etherToWei(validatedData.valueInEther)

    // Criar task no banco (SEM hash do contrato ainda)
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements,
        valueInWei,
        deadline: validatedData.deadline,
        allowOverdue: validatedData.allowOverdue,
        creatorId: user.id,
        status: TaskStatus.OPEN,
        // contractTaskId será preenchido quando o contrato for criado
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    console.log('✅ Task criada no banco com ID:', task.id)

    return {
      errors: {},
      message: 'Tarefa criada no banco com sucesso',
      success: true,
      taskId: task.id, // ← IMPORTANTE: Retornar o ID
    }
  } catch (error) {
    console.error('Erro na createTask:', error)

    if (error instanceof z.ZodError) {
      return {
        errors: error.flatten().fieldErrors,
        message: 'Dados inválidos. Corrija os erros.',
        success: false,
        taskId: '',
      }
    }

    return {
      errors: {},
      message:
        error instanceof Error ? error.message : 'Erro interno do servidor',
      success: false,
      taskId: '',
    }
  }
}

// NOVA: Action para atualizar task com hash do contrato
export async function updateTaskWithContractHash(
  prevState: any,
  formData: FormData,
) {
  try {
    const taskId = formData.get('taskId') as string
    const contractTxHash = formData.get('contractTxHash') as string

    if (!taskId || !contractTxHash) {
      return {
        success: false,
        message: 'TaskId e hash são obrigatórios',
      }
    }

    const user = await getCurrentUser()

    // Verificar se a task existe e pertence ao usuário
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        deletedAt: null,
      },
    })

    if (!task) {
      return {
        success: false,
        message: 'Tarefa não encontrada ou sem permissão',
      }
    }

    // Atualizar task com hash do contrato
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        contractTaskId: contractTxHash, // Salvar hash da transação
      },
    })

    // Registrar transação blockchain
    await prisma.blockchainTransaction.create({
      data: {
        taskId: task.id,
        userId: user.id,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.CONFIRMED,
        txHash: contractTxHash,
        valueInWei: task.valueInWei,
        networkId: '11155111',
      },
    })

    console.log('✅ Task atualizada com hash:', contractTxHash)

    return {
      success: true,
      message: 'Tarefa criada com sucesso',
    }
  } catch (error) {
    console.error('Erro ao atualizar task com hash:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

// ===== FUNÇÕES DE BUSCA (mantendo código existente) =====

export async function getTaskById(
  id: string,
): Promise<TaskWithRelations | null> {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        taskDeveloper: {
          include: {
            developer: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        repository: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return task as TaskWithRelations | null
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error)
    return null
  }
}

export async function getTasks(): Promise<TaskListResponse> {
  try {
    const [tasks] = await Promise.all([
      prisma.task.findMany({
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          taskDeveloper: {
            include: {
              developer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          repository: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
    ])

    return {
      tasks: tasks as TaskWithRelations[],
    }
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return {
      tasks: [],
    }
  }
}

export async function getMyTasks() {
  try {
    const user = await getCurrentUser()

    const [createdTasks, appliedTasks] = await Promise.all([
      // Tarefas que criei
      prisma.task.findMany({
        where: {
          creatorId: user.id,
          deletedAt: null,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          taskDeveloper: {
            include: {
              developer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          repository: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Tarefas onde apliquei
      prisma.task.findMany({
        where: {
          taskDeveloper: {
            developerId: user.id,
          },
          deletedAt: null,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          taskDeveloper: {
            include: {
              developer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          repository: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return {
      createdTasks: createdTasks as TaskWithRelations[],
      appliedTasks: appliedTasks as TaskWithRelations[],
    }
  } catch (error) {
    console.error('Erro ao buscar minhas tarefas:', error)
    return {
      createdTasks: [],
      appliedTasks: [],
    }
  }
}
