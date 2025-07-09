'use client'

import { useState, useEffect } from 'react'
import { TaskCard } from '@/components/tasks/task-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TaskWithRelations,
  TaskFilters,
  TaskSortOptions,
  TASK_STATUS_LABELS,
  TaskListResponse,
} from '@/types'
import { TaskStatus } from '@/lib/generated/prisma/client'
import { getTasks } from '@/actions/tasks'
import {
  Search,
  Filter,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Calendar,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TaskListProps {
  initialData?: TaskListResponse
  currentUserId?: string
  showFilters?: boolean
  variant?: 'default' | 'compact'
  title?: string
  description?: string
}

const SORT_OPTIONS: { value: TaskSortOptions; label: string }[] = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'oldest', label: 'Mais Antigas' },
  { value: 'highest_value', label: 'Maior Valor' },
  { value: 'lowest_value', label: 'Menor Valor' },
  { value: 'deadline_soon', label: 'Prazo Próximo' },
]

const STATUS_FILTER_OPTIONS = [
  { value: 'OPEN', label: 'Abertas', color: 'text-blue-600' },
  { value: 'IN_PROGRESS', label: 'Em Andamento', color: 'text-orange-600' },
  {
    value: 'PENDING_APPROVAL',
    label: 'Aguardando Aprovação',
    color: 'text-purple-600',
  },
  { value: 'COMPLETED', label: 'Concluídas', color: 'text-green-600' },
] as const

export function TaskList({
  initialData,
  currentUserId,
  showFilters = true,
  variant = 'default',
  title = 'Tarefas Disponíveis',
  description = 'Encontre tarefas que combinam com suas habilidades',
}: TaskListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Estados
  const [data, setData] = useState<TaskListResponse>(
    initialData || { tasks: [], total: 0, page: 1, limit: 10 },
  )
  const [isLoading, setIsLoading] = useState(!initialData)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>(
    (searchParams.get('status')?.split(',') as TaskStatus[]) || ['OPEN'],
  )
  const [sortBy, setSortBy] = useState<TaskSortOptions>(
    (searchParams.get('sort') as TaskSortOptions) || 'newest',
  )
  const [minValue, setMinValue] = useState(searchParams.get('minValue') || '')
  const [maxValue, setMaxValue] = useState(searchParams.get('maxValue') || '')

  // Fetch das tarefas
  const fetchTasks = async (page = 1, updateUrl = true) => {
    setIsLoading(true)

    try {
      const filters: TaskFilters = {
        search: searchTerm || undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        minValue: minValue || undefined,
        maxValue: maxValue || undefined,
      }

      const result = await getTasks(filters, sortBy, page, 10)
      setData(result)

      // Atualizar URL com parâmetros
      if (updateUrl) {
        const params = new URLSearchParams()
        if (searchTerm) params.set('search', searchTerm)
        if (selectedStatuses.length > 0)
          params.set('status', selectedStatuses.join(','))
        if (sortBy !== 'newest') params.set('sort', sortBy)
        if (minValue) params.set('minValue', minValue)
        if (maxValue) params.set('maxValue', maxValue)
        if (page > 1) params.set('page', page.toString())

        const newUrl = params.toString() ? `${pathname}?${params}` : pathname
        router.push(newUrl, { scroll: false })
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
      toast.error('Erro ao carregar tarefas')
    } finally {
      setIsLoading(false)
    }
  }

  // Efeito para buscar quando filtros mudarem
  useEffect(() => {
    if (initialData) return // Não buscar se já temos dados iniciais

    const timeoutId = setTimeout(() => {
      fetchTasks(1)
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedStatuses, sortBy, minValue, maxValue])

  // Handlers
  const handleStatusToggle = (status: TaskStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    )
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedStatuses(['OPEN'])
    setSortBy('newest')
    setMinValue('')
    setMaxValue('')
  }

  const handlePageChange = (newPage: number) => {
    fetchTasks(newPage)
  }

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Empty state
  const renderEmptyState = () => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
        <p className="text-muted-foreground text-center mb-4">
          {searchTerm || selectedStatuses.length > 1 || minValue || maxValue
            ? 'Tente ajustar os filtros para encontrar mais tarefas.'
            : 'Não há tarefas disponíveis no momento.'}
        </p>
        {(searchTerm ||
          selectedStatuses.length > 1 ||
          minValue ||
          maxValue) && (
          <Button variant="outline" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTER_OPTIONS.map((status) => (
                    <Badge
                      key={status.value}
                      variant={
                        selectedStatuses.includes(status.value)
                          ? 'default'
                          : 'outline'
                      }
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedStatuses.includes(status.value) && status.color,
                      )}
                      onClick={() => handleStatusToggle(status.value)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select
                  value={sortBy}
                  onValueChange={(value: TaskSortOptions) => setSortBy(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Valor Mínimo */}
              <div className="space-y-2">
                <Label htmlFor="minValue">Valor Mín. (ETH)</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="minValue"
                    type="number"
                    step="0.001"
                    placeholder="0.001"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Valor Máximo */}
              <div className="space-y-2">
                <Label htmlFor="maxValue">Valor Máx. (ETH)</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="maxValue"
                    type="number"
                    step="0.001"
                    placeholder="100"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Ações dos filtros */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {data.total} tarefa{data.total !== 1 ? 's' : ''} encontrada
                {data.total !== 1 ? 's' : ''}
              </div>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Tarefas */}
      <div>
        {isLoading ? (
          renderSkeleton()
        ) : data.tasks.length === 0 ? (
          renderEmptyState()
        ) : (
          <div
            className={cn(
              'space-y-4',
              variant === 'compact' &&
                'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0',
            )}
          >
            {data.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant={variant}
                currentUserId={currentUserId}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {data.total > data.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {data.page} de {Math.ceil(data.total / data.limit)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page + 1)}
              disabled={
                data.page >= Math.ceil(data.total / data.limit) || isLoading
              }
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
