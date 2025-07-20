// src/components/tasks/review/pull-request-preview.tsx
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Eye,
  Code,
} from 'lucide-react'
import type { PullRequestInfo } from './task-code-review'

export interface PullRequestFile {
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed'
  additions: number
  deletions: number
  changes: number
  patch?: string
  blob_url: string
}

interface PullRequestPreviewProps {
  taskId: string
  pullRequest: PullRequestInfo
}

export function PullRequestPreview({
  taskId,
  pullRequest,
}: PullRequestPreviewProps) {
  const [files, setFiles] = useState<PullRequestFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchFiles() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/github/pull-requests?taskId=${taskId}&prNumber=${pullRequest.number}&action=files`,
        )
        const result = await response.json()

        if (result.success && result.files) {
          setFiles(result.files)
          const autoExpand = result.files
            .slice(0, 3)
            .map((f: PullRequestFile) => f.filename)
          setExpandedFiles(new Set(autoExpand))
        } else {
          setError(result.error || 'Erro ao carregar arquivos')
        }
      } catch (error) {
        console.error('Erro ao buscar arquivos:', error)
        setError('Erro de conexão ao buscar arquivos')
      }

      setIsLoading(false)
    }

    fetchFiles()
  }, [taskId, pullRequest.number])

  const toggleFileExpansion = (filename: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename)
    } else {
      newExpanded.add(filename)
    }
    setExpandedFiles(newExpanded)
  }

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'removed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'modified':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'renamed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <Plus className="h-3 w-3" />
      case 'removed':
        return <Minus className="h-3 w-3" />
      case 'modified':
        return <FileText className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  const formatPatch = (patch: string) => {
    if (!patch) return null

    const lines = patch.split('\n').slice(0, 50)
    const isTruncated = patch.split('\n').length > 50

    return (
      <div className="bg-gray-50 rounded border text-xs font-mono overflow-x-auto">
        <div className="p-3">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`${
                line.startsWith('+')
                  ? 'bg-green-50 text-green-700'
                  : line.startsWith('-')
                  ? 'bg-red-50 text-red-700'
                  : line.startsWith('@@')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700'
              } px-2 py-0.5 leading-relaxed`}
            >
              {line || ' '}
            </div>
          ))}
          {isTruncated && (
            <div className="px-2 py-1 text-gray-500 italic">
              ... (patch truncado, ver completo no GitHub)
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carregando arquivos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600">
            Erro ao carregar arquivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Code className="h-5 w-5" />
          Pull Request #{pullRequest.number}: {pullRequest.title}
        </CardTitle>
        <CardDescription>
          {files.length} arquivo(s) modificado(s)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {pullRequest.body && (
          <div>
            <h4 className="font-medium mb-2">Descrição</h4>
            <div className="bg-gray-50 rounded p-3 text-sm whitespace-pre-wrap">
              {pullRequest.body}
            </div>
          </div>
        )}

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Arquivos Modificados</h4>
            <Button variant="outline" size="sm" asChild>
              <a
                href={pullRequest.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver no GitHub
              </a>
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <Collapsible
                key={file.filename}
                open={expandedFiles.has(file.filename)}
                onOpenChange={() => toggleFileExpansion(file.filename)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {expandedFiles.has(file.filename) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>

                      <Badge
                        variant="outline"
                        className={getFileStatusColor(file.status)}
                      >
                        {getFileStatusIcon(file.status)}
                        <span className="ml-1 capitalize">{file.status}</span>
                      </Badge>

                      <span className="font-mono text-sm">{file.filename}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      {file.additions > 0 && (
                        <span className="text-green-600">
                          +{file.additions}
                        </span>
                      )}
                      {file.deletions > 0 && (
                        <span className="text-red-600">-{file.deletions}</span>
                      )}

                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={file.blob_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="pl-6 pr-3 pb-3">
                    {file.patch ? (
                      formatPatch(file.patch)
                    ) : (
                      <div className="text-sm text-muted-foreground italic p-3 bg-gray-50 rounded">
                        Preview não disponível (arquivo muito grande ou binário)
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
