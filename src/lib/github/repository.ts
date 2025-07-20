import { getGitHubClient, githubConfig, type GitHubClient } from './client'

/**
 * Dados para criar um repositório de tarefa
 */
export interface CreateTaskRepositoryData {
  taskId: string
  title: string
  description: string
  clientName: string
  developerUsername?: string
}

/**
 * Resultado da criação do repositório
 */
export interface TaskRepositoryResult {
  repositoryName: string
  repositoryUrl: string
  githubRepoId: number
  success: boolean
  error?: string
}

/**
 * Gera nome padronizado do repositório
 */
function generateRepositoryName(taskId: string): string {
  return `gitfreelas-task-${taskId}`
}

/**
 * Cria conteúdo inicial do README.md
 */
function generateReadmeContent(data: CreateTaskRepositoryData): string {
  return `# ${data.title}

**Cliente:** ${data.clientName}
**Plataforma:** GitFreelas

## 📋 Descrição da Tarefa

${data.description}

## 🚀 Como começar

1. Clone este repositório
2. Desenvolva a solução conforme especificações
3. Faça commits organizados e descritivos
4. Quando terminar, crie um Pull Request

## 📝 Instruções

- Mantenha o código limpo e documentado
- Teste sua solução antes de submeter
- Inclua instruções de instalação/execução se necessário

## ✅ Critérios de Aprovação

A entrega será considerada completa quando:
- [ ] Todos os requisitos foram atendidos
- [ ] Código está funcionando corretamente
- [ ] Pull Request foi criado e está pronto para revisão

---
*Este repositório foi criado automaticamente pela plataforma GitFreelas*
`
}

/**
 * Cria um novo repositório para a tarefa
 */
export async function createTaskRepository(
  data: CreateTaskRepositoryData,
): Promise<TaskRepositoryResult> {
  try {
    const client = await getGitHubClient()
    const repositoryName = generateRepositoryName(data.taskId)

    // Criar o repositório na organização
    const { data: repo } = await client.rest.repos.createInOrg({
      org: githubConfig.owner, // 'gitfreelas-org'
      name: repositoryName,
      description: `[GitFreelas] ${data.title}`,
      private: true, // Repositório privado
      auto_init: true, // Cria com README automático
      has_issues: true,
      has_projects: false,
      has_wiki: false,
    })

    // Aguardar um pouco para o repo ser totalmente criado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Criar README personalizado
    const readmeContent = generateReadmeContent(data)

    try {
      // Primeiro, pegar o SHA do README existente
      const { data: existingReadme } = await client.rest.repos.getContent({
        owner: githubConfig.owner,
        repo: repositoryName,
        path: 'README.md',
      })

      // Atualizar o README existente
      await client.rest.repos.createOrUpdateFileContents({
        owner: githubConfig.owner,
        repo: repositoryName,
        path: 'README.md',
        message: 'docs: add task description and instructions',
        content: Buffer.from(readmeContent).toString('base64'),
        sha: Array.isArray(existingReadme) ? undefined : existingReadme.sha,
      })
    } catch (readmeError) {
      console.warn(
        'Aviso: Não foi possível criar README customizado:',
        readmeError,
      )
      // Não falha a operação por causa do README
    }

    return {
      repositoryName,
      repositoryUrl: repo.html_url,
      githubRepoId: repo.id,
      success: true,
    }
  } catch (error) {
    console.error('Erro ao criar repositório:', error)
    return {
      repositoryName: generateRepositoryName(data.taskId),
      repositoryUrl: '',
      githubRepoId: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Adiciona desenvolvedor como colaborador do repositório
 */
export async function addDeveloperToRepository(
  repositoryName: string,
  developerUsername: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await getGitHubClient()

    await client.rest.repos.addCollaborator({
      owner: githubConfig.owner,
      repo: repositoryName,
      username: developerUsername,
      permission: 'push', // Pode fazer push mas não admin
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao adicionar colaborador:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Remove desenvolvedor do repositório
 */
export async function removeDeveloperFromRepository(
  repositoryName: string,
  developerUsername: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await getGitHubClient()

    await client.rest.repos.removeCollaborator({
      owner: githubConfig.owner,
      repo: repositoryName,
      username: developerUsername,
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao remover colaborador:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Deleta o repositório (usado quando tarefa é cancelada)
 */
export async function deleteTaskRepository(
  repositoryName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await getGitHubClient()

    await client.rest.repos.delete({
      owner: githubConfig.owner,
      repo: repositoryName,
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar repositório:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Verifica se repositório existe
 */
export async function repositoryExists(
  repositoryName: string,
): Promise<boolean> {
  try {
    const client = await getGitHubClient()

    await client.rest.repos.get({
      owner: githubConfig.owner,
      repo: repositoryName,
    })

    return true
  } catch (error) {
    return false
  }
}
