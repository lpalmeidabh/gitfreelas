'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TASK_STATUS_LABELS } from '@/types'
import type { TaskStatus } from '@/lib/generated/prisma/client' // ← Importar do Prisma

interface TaskHeaderProps {
  title: string
  status: TaskStatus
}

export function TaskHeader({ title, status }: TaskHeaderProps) {
  const router = useRouter()
  const statusInfo = TASK_STATUS_LABELS[status]

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge variant="outline" className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>
    </div>
  )
}
