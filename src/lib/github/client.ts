import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'

// Configurações do GitHub App
const GITHUB_CONFIG = {
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  installationId: parseInt(process.env.GITHUB_INSTALLATION_ID!),
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
} as const

console.log('GITHUB_CONFIG:', GITHUB_CONFIG)
// Validar configurações essenciais
if (
  !GITHUB_CONFIG.appId ||
  !GITHUB_CONFIG.privateKey ||
  !GITHUB_CONFIG.installationId
) {
  throw new Error('Missing required GitHub App configuration')
}

/**
 * Cria cliente Octokit autenticado para a instalação
 */
export async function getGitHubClient(): Promise<Octokit> {
  try {
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: GITHUB_CONFIG.appId,
        privateKey: GITHUB_CONFIG.privateKey,
        installationId: GITHUB_CONFIG.installationId,
      },
    })

    return octokit
  } catch (error) {
    console.error('Erro ao criar cliente GitHub:', error)
    throw new Error('Falha na autenticação com GitHub')
  }
}

/**
 * Testa a conexão com GitHub
 */
export async function testGitHubConnection(): Promise<boolean> {
  try {
    const client = await getGitHubClient()

    // Testa fazendo uma chamada simples
    await client.rest.apps.getAuthenticated()
    return true
  } catch (error) {
    console.error('Teste de conexão GitHub falhou:', error)
    return false
  }
}

/**
 * Configurações exportadas (para outros módulos)
 */
export const githubConfig = {
  owner: 'gitfreelas-org', // Era 'gitfreelas'
  webhookSecret: GITHUB_CONFIG.webhookSecret,
} as const

/**
 * Tipos úteis
 */
export type GitHubClient = Octokit
export type Repository = Awaited<
  ReturnType<Octokit['rest']['repos']['get']>
>['data']
