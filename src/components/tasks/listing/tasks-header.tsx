// src/components/tasks/listing/tasks-header.tsx

import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'

export function TasksHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Search className="h-8 w-8" />
          Explorar Tarefas
        </h1>
        <p className="text-muted-foreground">
          Encontre oportunidades de desenvolvimento e ganhe em cripto
        </p>
      </div>

      <Link href="/tasks/create">
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Tarefa
        </Button>
      </Link>
    </div>
  )
}
