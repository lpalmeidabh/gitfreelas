'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Github,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Trash2,
  UserPlus,
  UserMinus,
  Eye,
  AlertTriangle,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'

// Tipos para os logs
type LogEntry = {
  id: string
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  operation: string
  message: string
  data?: any
}

export default function TestGitHubPage() {
  // Estados
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Dados de teste
  const [testData, setTestData] = useState({
    repositoryName: 'gitfreelas-test-repo',
    taskTitle: 'Teste de Integração GitHub',
    taskDescription:
      'Repositório criado para testar a integração da API GitHub',
    clientName: 'Cliente Teste',
    developerUsername: '', // Para preencher manualmente
  })

  // Estado dos testes
  const [testResults, setTestResults] = useState({
    connection: null as boolean | null,
    repositoryCreated: false,
    collaboratorAdded: false,
    repositoryExists: false,
  })

  // Função para adicionar log
  const addLog = (
    type: LogEntry['type'],
    operation: string,
    message: string,
    data?: any,
  ) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      operation,
      message,
      data,
    }
    setLogs((prev) => [newLog, ...prev])
  }

  // Função genérica para fazer chamadas
  const makeAPICall = async (
    operation: string,
    apiCall: () => Promise<any>,
    onSuccess?: (result: any) => void,
  ) => {
    setIsLoading(operation)
    addLog('info', operation, 'Iniciando operação...')

    try {
      const result = await apiCall()

      if (result.success) {
        addLog(
          'success',
          operation,
          result.message || 'Operação concluída com sucesso',
          result,
        )
        toast.success(`${operation} - Sucesso!`)
        onSuccess?.(result)
      } else {
        addLog('error', operation, result.error || 'Operação falhou', result)
        toast.error(`${operation} - Erro: ${result.error}`)
      }

      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido'
      addLog('error', operation, `Exceção: ${errorMessage}`, error)
      toast.error(`${operation} - Exceção: ${errorMessage}`)
      throw error
    } finally {
      setIsLoading(null)
    }
  }

  // 1. Testar Conexão
  const testConnection = async () => {
    await makeAPICall(
      'Teste de Conexão',
      async () => {
        const response = await fetch('/api/test/github-connection', {
          method: 'POST',
        })
        return await response.json()
      },
      (result) => {
        setTestResults((prev) => ({ ...prev, connection: true }))
      },
    )
  }

  // 2. Criar Repositório
  const createRepository = async () => {
    await makeAPICall(
      'Criar Repositório',
      async () => {
        const response = await fetch('/api/test/github-repository', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            repositoryName: testData.repositoryName,
            taskData: {
              taskId: 'test-task-id',
              title: testData.taskTitle,
              description: testData.taskDescription,
              clientName: testData.clientName,
            },
          }),
        })
        return await response.json()
      },
      (result) => {
        setTestResults((prev) => ({ ...prev, repositoryCreated: true }))
      },
    )
  }

  // 3. Verificar se Repositório Existe
  const checkRepository = async () => {
    await makeAPICall(
      'Verificar Repositório',
      async () => {
        const response = await fetch('/api/test/github-repository', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check',
            repositoryName: testData.repositoryName,
          }),
        })
        return await response.json()
      },
      (result) => {
        setTestResults((prev) => ({ ...prev, repositoryExists: result.exists }))
      },
    )
  }

  // 4. Adicionar Colaborador
  const addCollaborator = async () => {
    if (!testData.developerUsername.trim()) {
      toast.error(
        'Digite um username do GitHub para adicionar como colaborador',
      )
      return
    }

    await makeAPICall(
      'Adicionar Colaborador',
      async () => {
        const response = await fetch('/api/test/github-repository', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add-collaborator',
            repositoryName: testData.repositoryName,
            developerUsername: testData.developerUsername,
          }),
        })
        return await response.json()
      },
      (result) => {
        setTestResults((prev) => ({ ...prev, collaboratorAdded: true }))
      },
    )
  }

  // 5. Remover Colaborador
  const removeCollaborator = async () => {
    if (!testData.developerUsername.trim()) {
      toast.error('Digite um username do GitHub para remover como colaborador')
      return
    }

    await makeAPICall('Remover Colaborador', async () => {
      const response = await fetch('/api/test/github-repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove-collaborator',
          repositoryName: testData.repositoryName,
          developerUsername: testData.developerUsername,
        }),
      })
      return await response.json()
    })
  }

  // 6. Deletar Repositório
  const deleteRepository = async () => {
    await makeAPICall(
      'Deletar Repositório',
      async () => {
        const response = await fetch('/api/test/github-repository', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            repositoryName: testData.repositoryName,
          }),
        })
        return await response.json()
      },
      (result) => {
        setTestResults((prev) => ({
          ...prev,
          repositoryCreated: false,
          repositoryExists: false,
          collaboratorAdded: false,
        }))
      },
    )
  }

  // 7. Executar Todos os Testes
  const runAllTests = async () => {
    try {
      addLog(
        'info',
        'Teste Completo',
        'Iniciando sequência completa de testes...',
      )

      await testConnection()
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay entre testes

      await createRepository()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await checkRepository()

      if (testData.developerUsername.trim()) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await addCollaborator()
      }

      addLog(
        'success',
        'Teste Completo',
        'Todos os testes executados! Lembre-se de limpar os recursos criados.',
      )
      toast.success('Sequência de testes concluída!')
    } catch (error) {
      addLog(
        'error',
        'Teste Completo',
        'Sequência de testes interrompida por erro',
      )
      toast.error('Sequência de testes falhou')
    }
  }

  // Limpar logs
  const clearLogs = () => {
    setLogs([])
    toast.info('Logs limpos')
  }

  // Função para copiar log
  const copyLog = (log: LogEntry) => {
    const logText = `[${log.timestamp}] ${log.operation}: ${log.message}`
    navigator.clipboard.writeText(logText)
    toast.success('Log copiado para clipboard')
  }

  // Status Icon Component
  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null)
      return <div className="w-4 h-4 rounded-full bg-gray-300" />
    if (status === true)
      return <CheckCircle className="w-4 h-4 text-green-600" />
    return <XCircle className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TestTube className="h-8 w-8" />
          Teste GitHub API Integration
        </h1>
        <p className="text-muted-foreground mt-2">
          Teste todas as funcionalidades da integração GitHub antes de usar em
          produção
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna 1: Configuração e Controles */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status dos Testes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Status dos Testes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Conexão GitHub</span>
                <StatusIcon status={testResults.connection} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Repositório Criado</span>
                <StatusIcon status={testResults.repositoryCreated} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Repositório Existe</span>
                <StatusIcon status={testResults.repositoryExists} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Colaborador Adicionado</span>
                <StatusIcon status={testResults.collaboratorAdded} />
              </div>
            </CardContent>
          </Card>

          {/* Configuração de Dados de Teste */}
          <Card>
            <CardHeader>
              <CardTitle>Dados de Teste</CardTitle>
              <CardDescription>
                Configure os dados para os testes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repositoryName">Nome do Repositório</Label>
                <Input
                  id="repositoryName"
                  value={testData.repositoryName}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      repositoryName: e.target.value,
                    }))
                  }
                  placeholder="gitfreelas-test-repo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskTitle">Título da Tarefa</Label>
                <Input
                  id="taskTitle"
                  value={testData.taskTitle}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      taskTitle: e.target.value,
                    }))
                  }
                  placeholder="Teste de Integração"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskDescription">Descrição</Label>
                <Textarea
                  id="taskDescription"
                  value={testData.taskDescription}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      taskDescription: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  value={testData.clientName}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      clientName: e.target.value,
                    }))
                  }
                  placeholder="Cliente Teste"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="developerUsername">
                  Username GitHub (Desenvolvedor)
                </Label>
                <Input
                  id="developerUsername"
                  value={testData.developerUsername}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      developerUsername: e.target.value,
                    }))
                  }
                  placeholder="seuusername"
                />
                <p className="text-xs text-muted-foreground">
                  Para testar adicionar como colaborador
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2: Botões de Teste */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operações Individuais</CardTitle>
              <CardDescription>
                Execute cada teste individualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testConnection}
                disabled={isLoading === 'Teste de Conexão'}
                className="w-full justify-start"
                variant="outline"
              >
                {isLoading === 'Teste de Conexão' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                1. Testar Conexão
              </Button>

              <Button
                onClick={createRepository}
                disabled={isLoading === 'Criar Repositório'}
                className="w-full justify-start"
                variant="outline"
              >
                {isLoading === 'Criar Repositório' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Github className="w-4 h-4 mr-2" />
                )}
                2. Criar Repositório
              </Button>

              <Button
                onClick={checkRepository}
                disabled={isLoading === 'Verificar Repositório'}
                className="w-full justify-start"
                variant="outline"
              >
                {isLoading === 'Verificar Repositório' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                3. Verificar Repositório
              </Button>

              <Button
                onClick={addCollaborator}
                disabled={
                  isLoading === 'Adicionar Colaborador' ||
                  !testData.developerUsername.trim()
                }
                className="w-full justify-start"
                variant="outline"
              >
                {isLoading === 'Adicionar Colaborador' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                4. Adicionar Colaborador
              </Button>

              <Button
                onClick={removeCollaborator}
                disabled={
                  isLoading === 'Remover Colaborador' ||
                  !testData.developerUsername.trim()
                }
                className="w-full justify-start"
                variant="outline"
              >
                {isLoading === 'Remover Colaborador' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserMinus className="w-4 h-4 mr-2" />
                )}
                5. Remover Colaborador
              </Button>

              <Separator />

              <Button
                onClick={deleteRepository}
                disabled={isLoading === 'Deletar Repositório'}
                className="w-full justify-start"
                variant="destructive"
              >
                {isLoading === 'Deletar Repositório' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                🗑️ Deletar Repositório
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teste Automático</CardTitle>
              <CardDescription>
                Execute uma sequência completa de testes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={runAllTests}
                disabled={!!isLoading}
                className="w-full mb-4"
                size="lg"
              >
                {!!isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Executar Todos os Testes
              </Button>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Atenção</span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Lembre-se de deletar o repositório de teste após os testes
                  para limpar recursos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 3: Logs */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  📋 Logs de Execução
                </CardTitle>
                <Button
                  onClick={clearLogs}
                  variant="ghost"
                  size="sm"
                  disabled={logs.length === 0}
                >
                  Limpar
                </Button>
              </div>
              <CardDescription>
                Acompanhe o resultado de cada operação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Nenhum log ainda. Execute um teste para ver os resultados.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-md border-l-4 text-sm group relative"
                      style={{
                        borderLeftColor:
                          log.type === 'success'
                            ? '#22c55e'
                            : log.type === 'error'
                            ? '#ef4444'
                            : log.type === 'warning'
                            ? '#f59e0b'
                            : '#6b7280',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                log.type === 'success'
                                  ? 'default'
                                  : log.type === 'error'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {log.operation}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {log.timestamp}
                            </span>
                          </div>
                          <p
                            className={`${
                              log.type === 'success'
                                ? 'text-green-700 dark:text-green-300'
                                : log.type === 'error'
                                ? 'text-red-700 dark:text-red-300'
                                : log.type === 'warning'
                                ? 'text-yellow-700 dark:text-yellow-300'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {log.message}
                          </p>
                          {log.data && (
                            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-auto p-1"
                          onClick={() => copyLog(log)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
