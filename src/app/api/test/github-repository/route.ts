import { NextRequest, NextResponse } from 'next/server'
import {
  createTaskRepository,
  addDeveloperToRepository,
  removeDeveloperFromRepository,
  deleteTaskRepository,
  repositoryExists,
  type CreateTaskRepositoryData,
} from '@/lib/github/repository'
import { getGitHubClient, githubConfig } from '@/lib/github/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, repositoryName, taskData, developerUsername } = body

    console.log(`🧪 Executando ação GitHub: ${action}`)

    switch (action) {
      case 'create':
        return await handleCreateRepository(taskData)

      case 'check':
        return await handleCheckRepository(repositoryName)

      case 'add-collaborator':
        return await handleAddCollaborator(repositoryName, developerUsername)

      case 'remove-collaborator':
        return await handleRemoveCollaborator(repositoryName, developerUsername)

      case 'delete':
        return await handleDeleteRepository(repositoryName)

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Ação '${action}' não suportada`,
            supported_actions: [
              'create',
              'check',
              'add-collaborator',
              'remove-collaborator',
              'delete',
            ],
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error('❌ Erro na operação GitHub:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack:
                  process.env.NODE_ENV === 'development'
                    ? error.stack
                    : undefined,
              }
            : undefined,
      },
      { status: 500 },
    )
  }
}

// 1. Criar Repositório
async function handleCreateRepository(taskData: any) {
  if (!taskData || !taskData.title || !taskData.description) {
    return NextResponse.json(
      {
        success: false,
        error: 'Dados da tarefa incompletos',
        required: ['taskId', 'title', 'description', 'clientName'],
      },
      { status: 400 },
    )
  }

  const repositoryData: CreateTaskRepositoryData = {
    taskId: taskData.taskId || 'test-task',
    title: taskData.title,
    description: taskData.description,
    clientName: taskData.clientName || 'Cliente Teste',
    developerUsername: taskData.developerUsername,
  }

  const result = await createTaskRepository(repositoryData)

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Repositório criado com sucesso!',
      repository: {
        name: result.repositoryName,
        url: result.repositoryUrl,
        github_id: result.githubRepoId,
      },
      next_steps: [
        'Verificar se o repositório foi criado corretamente',
        'Testar adicionar colaborador se necessário',
        'Verificar se o README foi personalizado',
      ],
    })
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error || 'Falha ao criar repositório',
        troubleshooting: [
          'Verifique se você tem permissões para criar repositórios',
          'Confirme se o nome do repositório não já existe',
          'Verifique as configurações do GitHub App',
        ],
      },
      { status: 500 },
    )
  }
}

// 2. Verificar se Repositório Existe
async function handleCheckRepository(repositoryName: string) {
  if (!repositoryName) {
    return NextResponse.json(
      {
        success: false,
        error: 'Nome do repositório é obrigatório',
      },
      { status: 400 },
    )
  }

  const exists = await repositoryExists(repositoryName)

  if (exists) {
    // Se existe, buscar informações detalhadas
    try {
      const client = await getGitHubClient()
      const { data: repo } = await client.rest.repos.get({
        owner: githubConfig.owner,
        repo: repositoryName,
      })

      // Buscar colaboradores
      const { data: collaborators } = await client.rest.repos.listCollaborators(
        {
          owner: githubConfig.owner,
          repo: repositoryName,
        },
      )

      return NextResponse.json({
        success: true,
        exists: true,
        message: 'Repositório encontrado!',
        repository: {
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          clone_url: repo.clone_url,
          ssh_url: repo.ssh_url,
          private: repo.private,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          size: repo.size,
          language: repo.language,
          default_branch: repo.default_branch,
        },
        collaborators: collaborators.map((collab) => ({
          login: collab.login,
          permissions: collab.permissions,
        })),
        stats: {
          total_collaborators: collaborators.length,
          has_issues: repo.has_issues,
          has_projects: repo.has_projects,
          has_wiki: repo.has_wiki,
        },
      })
    } catch (error) {
      return NextResponse.json({
        success: true,
        exists: true,
        message: 'Repositório existe, mas erro ao buscar detalhes',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }
  } else {
    return NextResponse.json({
      success: true,
      exists: false,
      message: 'Repositório não encontrado',
      suggestion: 'Crie o repositório primeiro usando a ação "create"',
    })
  }
}

// 3. Adicionar Colaborador
async function handleAddCollaborator(
  repositoryName: string,
  developerUsername: string,
) {
  if (!repositoryName || !developerUsername) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Nome do repositório e username do desenvolvedor são obrigatórios',
      },
      { status: 400 },
    )
  }

  // Verificar se repositório existe primeiro
  const exists = await repositoryExists(repositoryName)
  if (!exists) {
    return NextResponse.json(
      {
        success: false,
        error: 'Repositório não existe',
        suggestion: 'Crie o repositório primeiro',
      },
      { status: 404 },
    )
  }

  const result = await addDeveloperToRepository(
    repositoryName,
    developerUsername,
  )

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: `Desenvolvedor ${developerUsername} adicionado como colaborador!`,
      collaborator: {
        username: developerUsername,
        repository: repositoryName,
        permission: 'push',
        added_at: new Date().toISOString(),
      },
      next_steps: [
        'O desenvolvedor receberá um convite por email',
        'Ele precisa aceitar o convite para ter acesso ao repositório',
        'Verifique a lista de colaboradores para confirmar',
      ],
    })
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error || 'Falha ao adicionar colaborador',
        troubleshooting: [
          'Verifique se o username do GitHub está correto',
          'Confirme se você tem permissões de administrador no repositório',
          'Verifique se o usuário não já é colaborador',
        ],
      },
      { status: 500 },
    )
  }
}

// 4. Remover Colaborador
async function handleRemoveCollaborator(
  repositoryName: string,
  developerUsername: string,
) {
  if (!repositoryName || !developerUsername) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Nome do repositório e username do desenvolvedor são obrigatórios',
      },
      { status: 400 },
    )
  }

  // Verificar se repositório existe
  const exists = await repositoryExists(repositoryName)
  if (!exists) {
    return NextResponse.json(
      {
        success: false,
        error: 'Repositório não existe',
      },
      { status: 404 },
    )
  }

  const result = await removeDeveloperFromRepository(
    repositoryName,
    developerUsername,
  )

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: `Desenvolvedor ${developerUsername} removido do repositório!`,
      action_taken: {
        username: developerUsername,
        repository: repositoryName,
        removed_at: new Date().toISOString(),
      },
    })
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error || 'Falha ao remover colaborador',
        troubleshooting: [
          'Verifique se o username está correto',
          'Confirme se o usuário realmente é colaborador',
          'Verifique suas permissões de administrador',
        ],
      },
      { status: 500 },
    )
  }
}

// 5. Deletar Repositório
async function handleDeleteRepository(repositoryName: string) {
  if (!repositoryName) {
    return NextResponse.json(
      {
        success: false,
        error: 'Nome do repositório é obrigatório',
      },
      { status: 400 },
    )
  }

  // Verificar se repositório existe
  const exists = await repositoryExists(repositoryName)
  if (!exists) {
    return NextResponse.json(
      {
        success: false,
        error: 'Repositório não existe ou já foi deletado',
      },
      { status: 404 },
    )
  }

  const result = await deleteTaskRepository(repositoryName)

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: `Repositório ${repositoryName} deletado com sucesso!`,
      deleted: {
        repository: repositoryName,
        deleted_at: new Date().toISOString(),
      },
      warning:
        'Esta ação é irreversível. Todo o código e histórico foram perdidos.',
    })
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error || 'Falha ao deletar repositório',
        troubleshooting: [
          'Verifique se você tem permissões de administrador',
          'Confirme se o repositório não está sendo usado ativamente',
          'Tente novamente em alguns segundos',
        ],
      },
      { status: 500 },
    )
  }
}

// Apenas POST é permitido
export async function GET() {
  return NextResponse.json(
    {
      error: 'Método não permitido. Use POST com action específica.',
      supported_actions: [
        'create',
        'check',
        'add-collaborator',
        'remove-collaborator',
        'delete',
      ],
      example: {
        action: 'create',
        taskData: {
          taskId: 'test-task',
          title: 'Teste',
          description: 'Descrição do teste',
          clientName: 'Cliente',
        },
      },
    },
    { status: 405 },
  )
}
