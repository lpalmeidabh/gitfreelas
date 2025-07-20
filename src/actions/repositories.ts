'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import {
  createTaskRepository,
  addDeveloperToRepository,
  removeDeveloperFromRepository,
  deleteTaskRepository,
  repositoryExists,
  type CreateTaskRepositoryData,
} from '@/lib/github/repository'
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

// ===== REPOSITORY ACTIONS =====

/**
 * Cria repositório quando desenvolvedor é aceito
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
        status: 'PENDING_APPROVAL',
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

    // ✅ CORREÇÃO: Buscar usernames reais do GitHub
    const { getGitHubUsername } = await import('@/lib/github/user-utils')
    const [developerUsername, clientUsername] = await Promise.all([
      getGitHubUsername(task.taskDeveloper.developer.id),
      getGitHubUsername(user.id),
    ])

    // 1. Atualizar status da task para COMPLETED
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
    })

    // 2. Ações GitHub (se PR number foi fornecido)
    if (prNumber && developerUsername && clientUsername) {
      try {
        // Importar funções GitHub
        const { addApprovalComment, closePullRequest } = await import(
          '@/lib/github/pull-requests'
        )
        const { finalizeRepositoryOwnership } = await import(
          '@/lib/github/repository'
        )

        console.log(`🔄 Iniciando workflow GitHub para task ${taskId}...`)

        // 2a. Adicionar comentário de aprovação na PR
        const commentResult = await addApprovalComment(
          taskId,
          parseInt(prNumber),
          feedback,
        )
        if (!commentResult.success) {
          console.warn('⚠️ Erro ao adicionar comentário:', commentResult.error)
        }

        // 2b. Fechar e fazer merge da PR
        const mergeResult = await closePullRequest(taskId, parseInt(prNumber))
        if (!mergeResult.success) {
          console.warn('⚠️ Erro ao fazer merge da PR:', mergeResult.error)
        }

        // 2c. Transferir controle do repositório para o cliente
        const ownershipResult = await finalizeRepositoryOwnership(
          taskId,
          developerUsername,
          clientUsername,
        )
        if (!ownershipResult.success) {
          console.warn(
            '⚠️ Erro ao transferir repositório:',
            ownershipResult.error,
          )
        }

        console.log(`✅ Workflow GitHub concluído:`, {
          comment: commentResult.success,
          merge: mergeResult.success,
          ownership: ownershipResult.success,
        })
      } catch (githubError) {
        console.error('❌ Erro nas ações GitHub:', githubError)
        // Não falha a aprovação por causa de erros GitHub
      }
    } else if (prNumber && (!developerUsername || !clientUsername)) {
      console.warn('⚠️ Não foi possível obter usernames do GitHub:', {
        developerUsername,
        clientUsername,
      })
    }

    console.log(
      `✅ Task ${taskId} aprovada com sucesso. PR #${prNumber}. Feedback: ${feedback}`,
    )

    // Revalidar caches (comentado para testes)
    // revalidatePath('/tasks')
    // revalidatePath('/dashboard')
    // revalidatePath(`/tasks/${taskId}`)

    return {
      success: true,
      message:
        'Trabalho aprovado com sucesso! Pagamento liberado e repositório transferido.',
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

export async function createRepositoryForTask(taskId: string) {
  try {
    const user = await getCurrentUser()

    // Buscar dados da tarefa com criador e desenvolvedor
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id, // Apenas o criador pode aceitar
        status: 'IN_PROGRESS',
        deletedAt: null,
      },
      include: {
        creator: true,
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
        error: 'Tarefa não encontrada ou sem permissão',
      }
    }

    if (!task.taskDeveloper) {
      return {
        success: false,
        error: 'Nenhum desenvolvedor aplicado na tarefa',
      }
    }

    // Verificar se já existe repositório
    const existingRepo = await prisma.taskRepository.findFirst({
      where: { taskId },
    })

    if (existingRepo) {
      return {
        success: false,
        error: 'Repositório já existe para esta tarefa',
      }
    }

    // ✅ CORREÇÃO: Buscar username real do GitHub
    const { getGitHubUsername } = await import('@/lib/github/user-utils')
    const developerUsername = await getGitHubUsername(
      task.taskDeveloper.developer.id,
    )

    if (!developerUsername) {
      return {
        success: false,
        error: 'Não foi possível obter username do GitHub do desenvolvedor',
      }
    }

    // Dados para criar o repositório
    const repoData: CreateTaskRepositoryData = {
      taskId,
      title: task.title,
      description: task.description,
      clientName: task.creator.email,
      developerUsername, // ✅ Agora usando username real do GitHub
    }

    // Criar repositório no GitHub
    const repoResult = await createTaskRepository(repoData)

    if (!repoResult.success) {
      return {
        success: false,
        error: `Erro ao criar repositório: ${repoResult.error}`,
      }
    }

    // Salvar repositório no banco
    const repository = await prisma.taskRepository.create({
      data: {
        taskId,
        repositoryName: repoResult.repositoryName,
        repositoryUrl: repoResult.repositoryUrl,
        githubRepoId: repoResult.githubRepoId,
        isActive: true,
      },
    })

    // Adicionar desenvolvedor como colaborador
    const addResult = await addDeveloperToRepository(
      repoResult.repositoryName,
      developerUsername, // ✅ Usando username real do GitHub
    )

    if (!addResult.success) {
      console.warn(
        'Aviso: Não foi possível adicionar desenvolvedor como colaborador:',
        addResult.error,
      )
      // Não falha a operação, pode ser adicionado manualmente
    }

    // revalidatePath('/tasks')
    // revalidatePath(`/tasks/${taskId}`)

    return {
      success: true,
      repository,
      message: 'Repositório criado com sucesso!',
    }
  } catch (error) {
    console.error('Erro ao criar repositório para tarefa:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

/**
 * Adiciona desenvolvedor ao repositório existente
 */
export async function addDeveloperToTaskRepository(
  taskId: string,
  developerUsername: string,
) {
  try {
    const user = await getCurrentUser()

    // Verificar permissão
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        deletedAt: null,
      },
      include: {
        repository: true,
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou sem permissão',
      }
    }

    if (!task.repository) {
      return {
        success: false,
        error: 'Repositório não encontrado para esta tarefa',
      }
    }

    // Adicionar no GitHub
    const result = await addDeveloperToRepository(
      task.repository.repositoryName,
      developerUsername,
    )

    if (!result.success) {
      return {
        success: false,
        error: `Erro ao adicionar desenvolvedor: ${result.error}`,
      }
    }

    return {
      success: true,
      message: 'Desenvolvedor adicionado ao repositório!',
    }
  } catch (error) {
    console.error('Erro ao adicionar desenvolvedor ao repositório:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

/**
 * Remove desenvolvedor do repositório
 */
export async function removeDeveloperFromTaskRepository(
  taskId: string,
  developerUsername: string,
) {
  try {
    const user = await getCurrentUser()

    // Verificar permissão
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        deletedAt: null,
      },
      include: {
        repository: true,
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou sem permissão',
      }
    }

    if (!task.repository) {
      return {
        success: false,
        error: 'Repositório não encontrado para esta tarefa',
      }
    }

    // Remover do GitHub
    const result = await removeDeveloperFromRepository(
      task.repository.repositoryName,
      developerUsername,
    )

    if (!result.success) {
      return {
        success: false,
        error: `Erro ao remover desenvolvedor: ${result.error}`,
      }
    }

    return {
      success: true,
      message: 'Desenvolvedor removido do repositório!',
    }
  } catch (error) {
    console.error('Erro ao remover desenvolvedor do repositório:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

/**
 * Deleta repositório quando tarefa é cancelada
 */
export async function deleteRepositoryForTask(taskId: string) {
  try {
    const user = await getCurrentUser()

    // Verificar permissão
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id,
        deletedAt: null,
      },
      include: {
        repository: true,
      },
    })

    if (!task) {
      return {
        success: false,
        error: 'Tarefa não encontrada ou sem permissão',
      }
    }

    if (!task.repository) {
      return {
        success: false,
        error: 'Repositório não encontrado para esta tarefa',
      }
    }

    // Deletar do GitHub
    const result = await deleteTaskRepository(task.repository.repositoryName)

    if (!result.success) {
      return {
        success: false,
        error: `Erro ao deletar repositório: ${result.error}`,
      }
    }

    // Marcar como deletado no banco (soft delete)
    await prisma.taskRepository.update({
      where: { id: task.repository.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    })

    // revalidatePath('/tasks')
    // revalidatePath(`/tasks/${taskId}`)

    return {
      success: true,
      message: 'Repositório deletado com sucesso!',
    }
  } catch (error) {
    console.error('Erro ao deletar repositório:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

/**
 * Verifica se repositório existe (utilitário)
 */
export async function checkRepositoryExists(taskId: string) {
  try {
    const repository = await prisma.taskRepository.findFirst({
      where: {
        taskId,
        isActive: true,
        deletedAt: null,
      },
    })

    if (!repository) {
      return { exists: false, repository: null }
    }

    // Verificar se existe no GitHub também
    const existsOnGitHub = await repositoryExists(repository.repositoryName)

    return {
      exists: existsOnGitHub,
      repository: existsOnGitHub ? repository : null,
    }
  } catch (error) {
    console.error('Erro ao verificar repositório:', error)
    return { exists: false, repository: null }
  }
}
