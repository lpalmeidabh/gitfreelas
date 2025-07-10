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
export async function createRepositoryForTask(taskId: string) {
  try {
    const user = await getCurrentUser()

    // Buscar dados da tarefa com criador e desenvolvedor
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        creatorId: user.id, // Apenas o criador pode aceitar
        status: 'APPLIED',
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

    // Dados para criar o repositório
    const repoData: CreateTaskRepositoryData = {
      taskId,
      title: task.title,
      description: task.description,
      clientName: task.creator.name,
      developerUsername: task.taskDeveloper.developer.name, // Assumindo que o name é o username
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
      task.taskDeveloper.developer.name,
    )

    if (!addResult.success) {
      console.warn(
        'Aviso: Não foi possível adicionar desenvolvedor como colaborador:',
        addResult.error,
      )
      // Não falha a operação, pode ser adicionado manualmente
    }

    revalidatePath('/tasks')
    revalidatePath(`/tasks/${taskId}`)

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

    revalidatePath('/tasks')
    revalidatePath(`/tasks/${taskId}`)

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
