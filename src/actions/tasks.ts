'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import {
  CreateTaskData,
  TaskFilters,
  TaskSortOptions,
  TaskWithRelations,
  TaskListResponse,
} from '@/types'
import {
  TaskStatus,
  TransactionStatus,
  TransactionType,
} from '@/lib/generated/prisma/client'
import { etherToWei } from '@/lib/web3/config'
import { revalidatePath } from 'next/cache'
import { createTaskFormSchema } from '@/lib/schemas/task'
import { redirect } from 'next/navigation'
import z from 'zod'

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

function buildTaskFilters(filters?: TaskFilters) {
  const where: any = {
    deletedAt: null, // Apenas tarefas não deletadas
  }

  if (filters?.status?.length) {
    where.status = { in: filters.status }
  }

  if (filters?.minValue) {
    where.valueInWei = { gte: filters.minValue }
  }

  if (filters?.maxValue) {
    where.valueInWei = { lte: filters.maxValue }
  }

  if (filters?.deadline?.from || filters?.deadline?.to) {
    where.deadline = {}
    if (filters.deadline.from) {
      where.deadline.gte = filters.deadline.from
    }
    if (filters.deadline.to) {
      where.deadline.lte = filters.deadline.to
    }
  }

  if (filters?.creatorId) {
    where.creatorId = filters.creatorId
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  return where
}

function buildTaskOrderBy(sort?: TaskSortOptions) {
  switch (sort) {
    case 'newest':
      return { createdAt: 'desc' as const }
    case 'oldest':
      return { createdAt: 'asc' as const }
    case 'highest_value':
      return { valueInWei: 'desc' as const }
    case 'lowest_value':
      return { valueInWei: 'asc' as const }
    case 'deadline_soon':
      return { deadline: 'asc' as const }
    default:
      return { createdAt: 'desc' as const }
  }
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
      contractTxHash: (formData.get('contractTxHash') as string) || undefined,
      walletAddress: (formData.get('walletAddress') as string) || undefined,
    }

    // Validar dados
    const validatedData = createTaskFormSchema.parse(rawData)

    // Verificar autenticação
    const user = await getCurrentUser()

    // Converter para Wei
    const valueInWei = etherToWei(validatedData.valueInEther)

    // Criar task no banco
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements,
        valueInWei,
        deadline: validatedData.deadline,
        allowOverdue: validatedData.allowOverdue,
        contractTaskId: validatedData.contractTxHash,
        creatorId: user.id,
        status: TaskStatus.OPEN,
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

    // Registrar transação blockchain (se houver)
    if (validatedData.contractTxHash) {
      await prisma.blockchainTransaction.create({
        data: {
          taskId: task.id,
          userId: user.id,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.CONFIRMED,
          txHash: validatedData.contractTxHash,
          valueInWei,
          networkId: '11155111',
        },
      })
    }

    // Revalidar cache
    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    // Sucesso - redirecionar
    redirect(`/tasks/${task.id}`)
  } catch (error) {
    console.error('Erro na createTask:', error)

    if (error instanceof z.ZodError) {
      return {
        errors: error.flatten().fieldErrors,
        message: 'Dados inválidos. Corrija os erros.',
        success: false,
      }
    }

    return {
      errors: {},
      message:
        error instanceof Error ? error.message : 'Erro interno do servidor',
      success: false,
    }
  }
}

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

export async function getTasks(
  filters?: TaskFilters,
  sort?: TaskSortOptions,
  page = 1,
  limit = 10,
): Promise<TaskListResponse> {
  try {
    const where = buildTaskFilters(filters)
    const orderBy = buildTaskOrderBy(sort)
    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
            take: 5, // Apenas as últimas 5 transações
          },
        },
      }),
      prisma.task.count({ where }),
    ])

    return {
      tasks: tasks as TaskWithRelations[],
      total,
      page,
      limit,
    }
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return {
      tasks: [],
      total: 0,
      page,
      limit,
    }
  }
}

export async function getMyTasks() {
  try {
    const user = await getCurrentUser()

    const [createdTasks, appliedTasks] = await Promise.all([
      // Tarefas que o usuário criou
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
          transactions: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Tarefas que o usuário se aplicou
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
          transactions: true,
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

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  try {
    const user = await getCurrentUser()

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id, // Apenas o criador pode alterar status
        deletedAt: null,
      },
    })

    if (!task) {
      return { success: false, error: 'Tarefa não encontrada ou sem permissão' }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    revalidatePath(`/tasks/${taskId}`)

    return { success: true, task: updatedTask }
  } catch (error) {
    console.error('Erro ao atualizar status da tarefa:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function deleteTask(taskId: string) {
  try {
    const user = await getCurrentUser()

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        status: TaskStatus.OPEN, // Só pode deletar se ainda estiver aberta
        deletedAt: null,
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada, sem permissão ou não pode ser deletada',
      }
    }

    // Soft delete
    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}
