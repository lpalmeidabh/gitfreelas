'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { TaskStatus } from '@/lib/generated/prisma/client'
import { revalidatePath } from 'next/cache'
import { isValidAddress } from '@/lib/web3/config'
import { createRepositoryForTask } from '@/actions/repositories'

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

// ===== DEVELOPER ACTIONS =====

export async function applyToTask(prevState: any, formData: FormData) {
  try {
    const user = await getCurrentUser()

    // Extrair dados do FormData
    const taskId = formData.get('taskId') as string
    const walletAddress = formData.get('walletAddress') as string

    // Validações
    if (!taskId) {
      return { success: false, error: 'ID da tarefa é obrigatório' }
    }

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return { success: false, error: 'Endereço de carteira inválido' }
    }

    // Verificar se a tarefa existe e está disponível
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        status: TaskStatus.OPEN,
        deletedAt: null,
      },
      include: {
        taskDeveloper: true,
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou não disponível',
      }
    }

    // Verificar se não é o próprio criador
    if (task.creatorId === user.id) {
      return {
        success: false,
        error: 'Você não pode se aplicar à sua própria tarefa',
      }
    }

    // Verificar se já tem desenvolvedor
    if (task.taskDeveloper) {
      return {
        success: false,
        error: 'Esta tarefa já tem um desenvolvedor aplicado',
      }
    }

    // Verificar se o desenvolvedor já tem uma tarefa ativa
    const activeDeveloperTask = await prisma.taskDeveloper.findFirst({
      where: {
        developerId: user.id,
        task: {
          status: {
            in: [
              TaskStatus.APPLIED,
              TaskStatus.IN_PROGRESS,
              TaskStatus.PENDING_APPROVAL,
            ],
          },
          deletedAt: null,
        },
      },
    })

    if (activeDeveloperTask) {
      return {
        success: false,
        error:
          'Você já tem uma tarefa ativa. Finalize-a antes de aplicar para outra.',
      }
    }

    // Criar aplicação em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar TaskDeveloper
      const taskDeveloper = await tx.taskDeveloper.create({
        data: {
          taskId,
          developerId: user.id,
          walletAddress,
          appliedAt: new Date(),
        },
      })

      // Atualizar status da tarefa
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.APPLIED },
      })

      return { taskDeveloper, updatedTask }
    })

    // revalidatePath('/tasks')
    // revalidatePath('/dashboard')
    // revalidatePath(`/tasks/${taskId}`)

    return { success: true, data: result }
  } catch (error) {
    console.error('Erro ao aplicar para tarefa:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function acceptDeveloper(prevState: any, taskId: string) {
  try {
    const user = await getCurrentUser()

    // Verificar se é o criador da tarefa
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        status: TaskStatus.APPLIED,
        deletedAt: null,
      },
      include: {
        taskDeveloper: {
          include: {
            developer: true,
          },
        },
        creator: true,
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou sem permissão para aceitar',
      }
    }

    if (!task.taskDeveloper) {
      return { success: false, error: 'Nenhum desenvolvedor aplicado' }
    }

    // Atualizar em transação
    const result = await prisma.$transaction(async (tx) => {
      // Aceitar o desenvolvedor
      const updatedTaskDeveloper = await tx.taskDeveloper.update({
        where: { id: task.taskDeveloper!.id },
        data: { acceptedAt: new Date() },
      })

      // Atualizar status da tarefa
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.IN_PROGRESS },
      })

      return { taskDeveloper: updatedTaskDeveloper, task: updatedTask }
    })

    // Criar repositório automaticamente
    console.log('Criando repositório para a tarefa aceita...')
    const repositoryResult = await createRepositoryForTask(taskId)

    if (repositoryResult.success) {
      console.log(
        '✅ Repositório criado com sucesso:',
        repositoryResult.repository?.repositoryName,
      )
    } else {
      console.error('❌ Erro ao criar repositório:', repositoryResult.error)
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    revalidatePath(`/tasks/${taskId}`)

    return {
      success: true,
      data: result,
      repository: repositoryResult.success ? repositoryResult.repository : null,
      message: repositoryResult.success
        ? 'Desenvolvedor aceito e repositório criado com sucesso!'
        : 'Desenvolvedor aceito! Repositório será criado em breve.',
    }
  } catch (error) {
    console.error('Erro ao aceitar desenvolvedor:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function rejectDeveloper(prevState: any, taskId: string) {
  try {
    const user = await getCurrentUser()

    // Verificar se é o criador da tarefa
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        status: TaskStatus.APPLIED,
        deletedAt: null,
      },
      include: {
        taskDeveloper: true,
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou sem permissão para rejeitar',
      }
    }

    if (!task.taskDeveloper) {
      return { success: false, error: 'Nenhum desenvolvedor aplicado' }
    }

    // Remover desenvolvedor e voltar status em transação
    await prisma.$transaction(async (tx) => {
      // Deletar TaskDeveloper
      await tx.taskDeveloper.delete({
        where: { id: task.taskDeveloper!.id },
      })

      // Voltar status da tarefa para OPEN
      await tx.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.OPEN },
      })
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    revalidatePath(`/tasks/${taskId}`)

    return { success: true }
  } catch (error) {
    console.error('Erro ao rejeitar desenvolvedor:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function submitTaskForApproval(prevState: any, taskId: string) {
  try {
    const user = await getCurrentUser()

    // Verificar se é o desenvolvedor da tarefa
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        taskDeveloper: {
          developerId: user.id,
        },
        status: TaskStatus.IN_PROGRESS,
        deletedAt: null,
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou sem permissão para submeter',
      }
    }

    // Atualizar status para pending approval
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.PENDING_APPROVAL },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    revalidatePath(`/tasks/${taskId}`)

    return { success: true, task: updatedTask }
  } catch (error) {
    console.error('Erro ao submeter tarefa para aprovação:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function cancelTaskApplication(prevState: any, taskId: string) {
  try {
    const user = await getCurrentUser()

    // Verificar se é o desenvolvedor da tarefa e está em status APPLIED
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        taskDeveloper: {
          developerId: user.id,
        },
        status: TaskStatus.APPLIED,
        deletedAt: null,
      },
      include: {
        taskDeveloper: true,
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Aplicação não encontrada ou não pode ser cancelada',
      }
    }

    // Remover aplicação em transação
    await prisma.$transaction(async (tx) => {
      // Deletar TaskDeveloper
      await tx.taskDeveloper.delete({
        where: { id: task.taskDeveloper!.id },
      })

      // Voltar status da tarefa para OPEN
      await tx.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.OPEN },
      })
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    revalidatePath(`/tasks/${taskId}`)

    return { success: true }
  } catch (error) {
    console.error('Erro ao cancelar aplicação:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}
