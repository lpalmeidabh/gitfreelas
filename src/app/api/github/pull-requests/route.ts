// src/app/api/github/pull-requests/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  getPullRequestsForTask,
  getPullRequestFiles,
} from '@/lib/github/pull-requests'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const prNumber = searchParams.get('prNumber')
    const action = searchParams.get('action') || 'list'

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId é obrigatório' },
        { status: 400 },
      )
    }

    switch (action) {
      case 'list':
        const prsResult = await getPullRequestsForTask(taskId)
        return NextResponse.json(prsResult)

      case 'files':
        if (!prNumber) {
          return NextResponse.json(
            { error: 'prNumber é obrigatório para buscar arquivos' },
            { status: 400 },
          )
        }
        const filesResult = await getPullRequestFiles(
          taskId,
          parseInt(prNumber),
        )
        return NextResponse.json(filesResult)

      default:
        return NextResponse.json(
          { error: 'Ação não suportada' },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error('Erro na API de GitHub:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}
