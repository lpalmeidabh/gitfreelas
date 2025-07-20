// src/lib/github/pull-requests.ts
import { getGitHubClient, githubConfig } from './client'

export interface PullRequestInfo {
  number: number
  title: string
  body: string
  state: 'open' | 'closed' | 'merged'
  user: {
    login: string
    avatar_url: string
  }
  html_url: string
  created_at: string
  updated_at: string
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
  }
  additions: number
  deletions: number
  changed_files: number
}

export interface PullRequestFile {
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed'
  additions: number
  deletions: number
  changes: number
  patch?: string
  blob_url: string
}

/**
 * Busca todas as PRs abertas para uma task
 */
/**
 * Busca todas as PRs abertas para uma task
 */
export async function getPullRequestsForTask(
  taskId: string,
): Promise<{
  success: boolean
  pullRequests?: PullRequestInfo[]
  error?: string
}> {
  try {
    const client = await getGitHubClient()
    const repositoryName = `gitfreelas-task-${taskId}`

    const { data: pullRequests } = await client.rest.pulls.list({
      owner: githubConfig.owner,
      repo: repositoryName,
      state: 'open',
      sort: 'created',
      direction: 'desc',
    })

    // Para cada PR, buscar detalhes completos que incluem additions/deletions
    const formattedPRs: PullRequestInfo[] = await Promise.all(
      pullRequests.map(async (pr) => {
        try {
          // Buscar detalhes completos da PR individual
          const { data: prDetails } = await client.rest.pulls.get({
            owner: githubConfig.owner,
            repo: repositoryName,
            pull_number: pr.number,
          })

          return {
            number: pr.number,
            title: pr.title,
            body: pr.body || '',
            state: pr.state as 'open' | 'closed' | 'merged',
            user: {
              login: pr.user?.login || 'unknown',
              avatar_url: pr.user?.avatar_url || '',
            },
            html_url: pr.html_url,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            head: {
              ref: pr.head.ref,
              sha: pr.head.sha,
            },
            base: {
              ref: pr.base.ref,
            },
            additions: prDetails.additions || 0,
            deletions: prDetails.deletions || 0,
            changed_files: prDetails.changed_files || 0,
          }
        } catch (error) {
          console.warn(`Erro ao buscar detalhes da PR #${pr.number}:`, error)
          // Retorna PR sem estatísticas em caso de erro
          return {
            number: pr.number,
            title: pr.title,
            body: pr.body || '',
            state: pr.state as 'open' | 'closed' | 'merged',
            user: {
              login: pr.user?.login || 'unknown',
              avatar_url: pr.user?.avatar_url || '',
            },
            html_url: pr.html_url,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            head: {
              ref: pr.head.ref,
              sha: pr.head.sha,
            },
            base: {
              ref: pr.base.ref,
            },
            additions: 0,
            deletions: 0,
            changed_files: 0,
          }
        }
      }),
    )

    return {
      success: true,
      pullRequests: formattedPRs,
    }
  } catch (error) {
    console.error('Erro ao buscar PRs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
/**
 * Busca arquivos modificados em uma PR específica
 */
export async function getPullRequestFiles(
  taskId: string,
  prNumber: number,
): Promise<{ success: boolean; files?: PullRequestFile[]; error?: string }> {
  try {
    const client = await getGitHubClient()
    const repositoryName = `gitfreelas-task-${taskId}`

    const { data: files } = await client.rest.pulls.listFiles({
      owner: githubConfig.owner,
      repo: repositoryName,
      pull_number: prNumber,
    })

    const formattedFiles: PullRequestFile[] = files.map((file) => ({
      filename: file.filename,
      status: file.status as 'added' | 'removed' | 'modified' | 'renamed',
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch,
      blob_url: file.blob_url,
    }))

    return {
      success: true,
      files: formattedFiles,
    }
  } catch (error) {
    console.error('Erro ao buscar arquivos da PR:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Busca informações básicas do repositório
 */
export async function getRepositoryInfo(taskId: string) {
  try {
    const client = await getGitHubClient()
    const repositoryName = `gitfreelas-task-${taskId}`

    const { data: repo } = await client.rest.repos.get({
      owner: githubConfig.owner,
      repo: repositoryName,
    })

    return {
      success: true,
      repository: {
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at,
      },
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Repositório não encontrado',
    }
  }
}
