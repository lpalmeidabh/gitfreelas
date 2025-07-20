// src/components/tasks/review/task-code-review.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  GitPullRequest,
  FileText,
  Calendar,
  User,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react'
import { TaskWithRelations } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PullRequestPreview } from './pull-request-preview'
import { TaskReviewActions } from './task-review-actions'

// Tipos locais (copiados do pull-requests.ts)
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

interface TaskCodeReviewProps {
  task: TaskWithRelations
}

export function TaskCodeReview({ task }: TaskCodeReviewProps) {
  const [pullRequests, setPullRequests] = useState<PullRequestInfo[]>([])
  const [selectedPR, setSelectedPR] = useState<PullRequestInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar PRs via API
  useEffect(() => {
    async function fetchPullRequests() {
      setIsLoading(true)

      try {
        const response = await fetch(
          `/api/github/pull-requests?taskId=${task.id}&action=list`,
        )
        const result = await response.json()

        if (result.success && result.pullRequests) {
          setPullRequests(result.pullRequests)
          // Auto-selecionar primeira PR se houver
          if (result.pullRequests.length > 0) {
            setSelectedPR(result.pullRequests[0])
          }
        } else {
          setError(result.error || 'Erro ao carregar pull requests')
        }
      } catch (error) {
        console.error('Erro ao buscar PRs:', error)
        setError('Erro de conexão ao buscar pull requests')
      }

      setIsLoading(false)
    }

    fetchPullRequests()
  }, [task.id])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Code Review...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar informações do repositório: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (pullRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5" />
            Code Review
          </CardTitle>
          <CardDescription>
            Aguardando o desenvolvedor criar um Pull Request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              Nenhum Pull Request encontrado ainda. O desenvolvedor deve criar
              uma PR para submeter o trabalho.
            </AlertDescription>
          </Alert>

          {task.repository && (
            <div className="mt-4">
              <Button variant="outline" asChild>
                <a
                  href={task.repository.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Repositório no GitHub
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5" />
            Code Review
          </CardTitle>
          <CardDescription>
            Revise o trabalho entregue pelo desenvolvedor
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Lista de Pull Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Pull Requests ({pullRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pullRequests.map((pr) => (
            <div
              key={pr.number}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPR?.number === pr.number
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedPR(pr)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">#{pr.number}</Badge>
                    <h4 className="font-medium">{pr.title}</h4>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {pr.user.login}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(pr.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">+{pr.additions}</span>
                    <span className="text-red-600">-{pr.deletions}</span>
                    <span className="text-muted-foreground">
                      {pr.changed_files} arquivos
                    </span>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preview da PR Selecionada */}
      {selectedPR && (
        <PullRequestPreview taskId={task.id} pullRequest={selectedPR} />
      )}

      {/* Actions de Aprovação/Rejeição */}
      {selectedPR && <TaskReviewActions task={task} selectedPR={selectedPR} />}
    </div>
  )
}
