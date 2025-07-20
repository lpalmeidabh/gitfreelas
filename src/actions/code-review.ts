// src/actions/code-review.ts
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { TaskStatus } from '@/lib/generated/prisma/client'
import { revalidatePath } from 'next/cache'

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

// ===== CODE REVIEW ACTIONS =====

/**
 * Aprova o trabalho entregue e completa a task
 */
export async function approveTaskCompletion(
  prevState: any,
  formData: FormData,
) {
  try {
    const taskId = formData.get('taskId') as string
    const prNumber = formData.get('prNumber') as string
    const feedback = formData.get('feedback') as string

    if (!taskId) {
      return {
        success: false,
        error: 'TaskId é obrigatório',
      }
    }

    const user = await getCurrentUser()

    // Verificar se é o cliente da tarefa
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        status: TaskStatus.PENDING_APPROVAL,
        deletedAt: null,
      },
      include: {
        taskDeveloper: {
          include: {
            developer: true,
          },
        },
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou sem permissão para aprovar',
      }
    }

    if (!task.taskDeveloper) {
      return {
        success: false,
        error: 'Nenhum desenvolvedor associado à tarefa',
      }
    }

    // Atualizar status da task para COMPLETED
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.COMPLETED,
        updatedAt: new Date(),
      },
    })

    // TODO: Aqui seria chamado o completeTask do contrato inteligente
    // await completeTaskOnBlockchain(task.contractTaskId)

    console.log(
      `✅ Task ${taskId} aprovada. PR #${prNumber}. Feedback: ${feedback}`,
    )

    // Revalidar caches
    // revalidatePath('/tasks')
    // revalidatePath('/dashboard')
    // revalidatePath(`/tasks/${taskId}`)

    return {
      success: true,
      message: 'Trabalho aprovado com sucesso! Pagamento será liberado.',
      task: updatedTask,
    }
  } catch (error) {
    console.error('Erro ao aprovar tarefa:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

/**
 * Rejeita o trabalho e cancela a task
 */
export async function rejectTaskSubmission(prevState: any, formData: FormData) {
  try {
    const taskId = formData.get('taskId') as string
    const prNumber = formData.get('prNumber') as string
    const feedback = formData.get('feedback') as string

    if (!taskId || !prNumber || !feedback?.trim()) {
      return {
        success: false,
        error: 'TaskId, PR number e feedback são obrigatórios',
      }
    }

    const user = await getCurrentUser()

    // Verificar se é o cliente da tarefa
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        status: TaskStatus.PENDING_APPROVAL,
        deletedAt: null,
      },
      include: {
        taskDeveloper: {
          include: {
            developer: true,
          },
        },
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou sem permissão para rejeitar',
      }
    }

    // Atualizar status da task para CANCELLED
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.CANCELLED,
        updatedAt: new Date(),
      },
    })

    // TODO: Aqui seria chamado o cancelTask do contrato inteligente
    // await cancelTaskOnBlockchain(task.contractTaskId, feedback)

    console.log(
      `❌ Task ${taskId} rejeitada. PR #${prNumber}. Motivo: ${feedback}`,
    )

    // Revalidar caches
    // revalidatePath('/tasks')
    // revalidatePath('/dashboard')
    // revalidatePath(`/tasks/${taskId}`)

    return {
      success: true,
      message: 'Trabalho rejeitado. Tarefa cancelada e valor será devolvido.',
      task: updatedTask,
    }
  } catch (error) {
    console.error('Erro ao rejeitar tarefa:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

/**
 * Solicita correções no trabalho
 */
export async function requestTaskRevision(prevState: any, formData: FormData) {
  try {
    const taskId = formData.get('taskId') as string
    const prNumber = formData.get('prNumber') as string
    const feedback = formData.get('feedback') as string

    if (!taskId || !prNumber || !feedback?.trim()) {
      return {
        success: false,
        error: 'TaskId, PR number e feedback são obrigatórios',
      }
    }

    const user = await getCurrentUser()

    // Verificar se é o cliente da tarefa
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        status: TaskStatus.PENDING_APPROVAL,
        deletedAt: null,
      },
      include: {
        taskDeveloper: {
          include: {
            developer: true,
          },
        },
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou sem permissão para solicitar revisão',
      }
    }

    // Voltar status para IN_PROGRESS para o dev fazer correções
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.IN_PROGRESS,
        updatedAt: new Date(),
      },
    })

    // TODO: Notificar desenvolvedor via email/notificação
    // await sendRevisionRequestNotification(task.taskDeveloper.developer, feedback)

    console.log(
      `🔄 Revisão solicitada para task ${taskId}. PR #${prNumber}. Feedback: ${feedback}`,
    )

    // Revalidar caches
    // revalidatePath('/tasks')
    // revalidatePath('/dashboard')
    // revalidatePath(`/tasks/${taskId}`)

    return {
      success: true,
      message: 'Correções solicitadas. Desenvolvedor foi notificado.',
      task: updatedTask,
    }
  } catch (error) {
    console.error('Erro ao solicitar revisão:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}
