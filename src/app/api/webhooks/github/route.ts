// src/app/api/webhooks/github/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/github/webhook'
import { prisma } from '@/lib/prisma'
import { TaskStatus } from '@/lib/generated/prisma/client'

interface GitHubWebhookPayload {
  action: string
  pull_request?: {
    id: number
    number: number
    title: string
    body: string
    user: {
      login: string
    }
    head: {
      ref: string
      sha: string
    }
    base: {
      ref: string
    }
    html_url: string
    created_at: string
  }
  repository: {
    id: number
    name: string
    full_name: string
    html_url: string
  }
  sender: {
    login: string
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔗 GitHub Webhook recebido')

    // 1. Verificar signature do webhook
    const body = await req.text()
    const signature = req.headers.get('x-hub-signature-256')

    if (!signature || !(await verifyWebhookSignature(body, signature))) {
      console.error('❌ Webhook signature inválida')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Parse do payload
    const payload: GitHubWebhookPayload = JSON.parse(body)
    console.log(
      `📥 Evento: ${payload.action} no repo: ${payload.repository.name}`,
    )

    // 3. Verificar se é evento de PR opened
    if (payload.action !== 'opened' || !payload.pull_request) {
      console.log('ℹ️ Evento ignorado (não é pull_request.opened)')
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 })
    }

    // 4. Verificar se é repositório da plataforma
    const repoName = payload.repository.name
    if (!repoName.startsWith('gitfreelas-task-')) {
      console.log('ℹ️ Repositório ignorado (não é da plataforma)')
      return NextResponse.json(
        { message: 'Repository ignored' },
        { status: 200 },
      )
    }

    // 5. Extrair taskId do nome do repositório
    const taskId = repoName.replace('gitfreelas-task-', '')
    console.log(`🎯 TaskId extraído: ${taskId}`)

    // 6. Buscar task no banco
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
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
      console.error('❌ Task não encontrada ou não está IN_PROGRESS')
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // 7. Verificar se PR foi criada pelo desenvolvedor correto
    const developerUsername = task.taskDeveloper?.developer.name
    const prAuthor = payload.pull_request.user.login

    if (developerUsername !== prAuthor) {
      console.warn(
        `⚠️ PR criada por usuário incorreto: ${prAuthor} (esperado: ${developerUsername})`,
      )
      return NextResponse.json(
        { error: 'Unauthorized PR author' },
        { status: 403 },
      )
    }

    // 8. Atualizar status da task para PENDING_APPROVAL
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.PENDING_APPROVAL,
        updatedAt: new Date(),
      },
    })

    console.log(`✅ Task ${taskId} atualizada para PENDING_APPROVAL`)

    // 9. TODO: Notificar cliente via email/notificação
    // await sendNotificationToClient(task.creator, {
    //   type: 'PR_CREATED',
    //   taskTitle: task.title,
    //   prUrl: payload.pull_request.html_url,
    // })

    return NextResponse.json({
      success: true,
      message: 'Task status updated to PENDING_APPROVAL',
      taskId,
      prUrl: payload.pull_request.html_url,
    })
  } catch (error) {
    console.error('❌ Erro no webhook GitHub:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// Método não suportado
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for webhooks.' },
    { status: 405 },
  )
}
// export async function POST(req: Request) {
//   return new Response('Webhook received', {
//     status: 200,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
// }
