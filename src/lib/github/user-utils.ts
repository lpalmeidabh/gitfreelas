// src/lib/github/user-utils.ts
import { prisma } from '@/lib/prisma'
import { getGitHubClient } from './client'

/**
 * Busca o username do GitHub via API usando o accountId
 */
export async function getGitHubUsername(
  userId: string,
): Promise<string | null> {
  try {
    // 1. Buscar accountId do GitHub para este usuário
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: 'github',
      },
    })

    if (!account?.accountId) {
      console.warn(`❌ Account GitHub não encontrado para user ${userId}`)
      return null
    }

    // 2. Buscar username via GitHub API
    const client = await getGitHubClient()
    const response = await client.rest.users.getById({
      account_id: parseInt(account.accountId),
    })

    const username = response.data.login
    console.log(`✅ Username encontrado: ${account.accountId} → ${username}`)

    return username
  } catch (error) {
    console.error(
      `❌ Erro ao buscar username GitHub para user ${userId}:`,
      error,
    )
    return null
  }
}
