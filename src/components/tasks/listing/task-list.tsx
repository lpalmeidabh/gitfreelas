// src/components/tasks/listing/task-list.tsx
'use client'

import { getTasks } from '@/actions/tasks'
import { TaskCard } from '@/components/tasks/task-card'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TaskListResponse } from '@/types'
import { Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface TaskListProps {
  initialData?: TaskListResponse
  variant?: 'default' | 'compact'
  title?: string
  description?: string
}

export function TaskList({
  initialData,
  variant = 'default',
  title = 'Tarefas Disponíveis',
  description = '',
}: TaskListProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Estados
  const [data, setData] = useState<TaskListResponse>(
    initialData || { tasks: [] },
  )
  const [isLoading, setIsLoading] = useState(!initialData)

  // Fetch das tarefas
  const fetchTasks = async (page = 1, updateUrl = true) => {
    setIsLoading(true)

    try {
      const result = await getTasks()
      setData(result)

      // Atualizar URL com parâmetros
      if (updateUrl) {
        const params = new URLSearchParams()
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
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

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
              <TaskCard key={task.id} task={task} showActions={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
