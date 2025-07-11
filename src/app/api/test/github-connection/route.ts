import { NextRequest, NextResponse } from 'next/server'
import { testGitHubConnection, getGitHubClient } from '@/lib/github/client'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Iniciando teste de conexão GitHub...')

    // Testar conexão básica
    const isConnected = await testGitHubConnection()

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Falha na conexão com GitHub API',
          details: 'Verifique as configurações do GitHub App',
        },
        { status: 500 },
      )
    }

    // Se conectou, buscar informações detalhadas
    const client = await getGitHubClient()

    // Informações do App
    const appInfo = await client.rest.apps.getAuthenticated()

    // Informações da Instalação
    const installationInfo = await client.rest.apps.getInstallation({
      installation_id: parseInt(process.env.GITHUB_INSTALLATION_ID!),
    })

    // Repositórios disponíveis
    const reposResponse =
      await client.rest.apps.listReposAccessibleToInstallation({
        per_page: 5, // Apenas alguns para teste
      })

    // Determinar nome da conta de forma simples
    let accountName = 'N/A'
    if (installationInfo.data?.account) {
      const acc = installationInfo.data.account as any
      accountName = acc.login || acc.name || 'N/A'
    }

    // Verificar se temos permissões necessárias
    const permissions = installationInfo.data?.permissions || {}
    const requiredPermissions = {
      contents: 'write',
      metadata: 'read',
      administration: 'write',
      members: 'read',
    }

    const permissionCheck = Object.entries(requiredPermissions).map(
      ([key, required]) => ({
        permission: key,
        required,
        actual: (permissions as any)[key] || 'none',
        ok: ((permissions as any)[key] || 'none') === required,
      }),
    )

    const allPermissionsOk = permissionCheck.every((p) => p.ok)

    return NextResponse.json({
      success: true,
      message: 'Conexão GitHub estabelecida com sucesso!',
      connection: {
        authenticated: true,
        timestamp: new Date().toISOString(),
      },
      app: {
        id: appInfo.data?.id || 'N/A',
        name: appInfo.data?.name || 'N/A',
        owner: (appInfo.data?.owner as any)?.login || 'N/A',
        created_at: appInfo.data?.created_at || 'N/A',
      },
      installation: {
        id: installationInfo.data?.id || 'N/A',
        account: accountName,
        target_type: installationInfo.data?.target_type || 'N/A',
        created_at: installationInfo.data?.created_at || 'N/A',
        suspended_at: installationInfo.data?.suspended_at || null,
      },
      permissions: {
        all_ok: allPermissionsOk,
        details: permissionCheck,
      },
      repositories: {
        total_count: reposResponse.data?.total_count || 0,
        accessible: (reposResponse.data?.repositories || []).map((repo) => ({
          name: repo?.name || 'N/A',
          full_name: repo?.full_name || 'N/A',
          private: repo?.private || false,
          permissions: (repo as any)?.permissions || {},
        })),
      },
      environment: {
        app_id: process.env.GITHUB_APP_ID ? '✅ Configurado' : '❌ Faltando',
        private_key: process.env.GITHUB_APP_PRIVATE_KEY
          ? '✅ Configurado'
          : '❌ Faltando',
        installation_id: process.env.GITHUB_INSTALLATION_ID
          ? '✅ Configurado'
          : '❌ Faltando',
        webhook_secret: process.env.GITHUB_WEBHOOK_SECRET
          ? '✅ Configurado'
          : '❌ Faltando',
      },
    })
  } catch (error) {
    console.error('❌ Erro no teste de conexão GitHub:', error)

    // Diferentes tipos de erro
    let errorMessage = 'Erro desconhecido na conexão GitHub'
    let errorDetails = {}

    if (error instanceof Error) {
      errorMessage = error.message

      // Casos específicos de erro
      if (error.message.includes('Bad credentials')) {
        errorMessage =
          'Credenciais inválidas - verifique GITHUB_APP_ID e GITHUB_APP_PRIVATE_KEY'
      } else if (error.message.includes('Not Found')) {
        errorMessage =
          'Installation não encontrada - verifique GITHUB_INSTALLATION_ID'
      } else if (error.message.includes('private key')) {
        errorMessage =
          'Chave privada inválida - verifique formato da GITHUB_APP_PRIVATE_KEY'
      }

      // Adicionar detalhes técnicos para debug
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        environment_check: {
          app_id: !!process.env.GITHUB_APP_ID,
          private_key: !!process.env.GITHUB_APP_PRIVATE_KEY,
          installation_id: !!process.env.GITHUB_INSTALLATION_ID,
          webhook_secret: !!process.env.GITHUB_WEBHOOK_SECRET,
        },
        troubleshooting: [
          'Verifique se todas as variáveis de ambiente estão configuradas',
          'Confirme se o GitHub App está instalado na organização correta',
          'Verifique se as permissões do App incluem Contents:Write e Administration:Write',
          'Teste se a chave privada está no formato correto (com \\n convertidos)',
          'Confirme se o INSTALLATION_ID corresponde à instalação ativa',
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
      error: 'Método não permitido. Use POST para testar a conexão.',
    },
    { status: 405 },
  )
}
