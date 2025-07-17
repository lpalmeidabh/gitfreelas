'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TaskWithRelations } from '@/types'
import { User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ApplyTaskModal } from './apply-task-modal'

interface ApplyTaskButtonProps {
  task: TaskWithRelations
  currentUserId?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  disabled?: boolean
}

export function ApplyTaskButton({
  task,
  currentUserId,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
}: ApplyTaskButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Verificações de elegibilidade
  const isOwner = currentUserId === task.creatorId
  const hasAppliedDeveloper = !!task.taskDeveloper
  const isTaskOpen = task.status === 'OPEN'
  const canApply = isTaskOpen && !isOwner && !hasAppliedDeveloper && !disabled

  // Handler para fechar modal e refresh
  const handleClose = () => {
    setIsOpen(false)
    router.refresh()
  }

  // Se não pode aplicar, retorna botão desabilitado
  if (!canApply) {
    let reason = ''
    if (isOwner) reason = 'Sua tarefa'
    else if (hasAppliedDeveloper) reason = 'Já tem desenvolvedor'
    else if (!isTaskOpen) reason = 'Não disponível'
    else if (disabled) reason = 'Indisponível'

    return (
      <Button
        variant="outline"
        size={size}
        className={cn(className, 'cursor-not-allowed')}
        disabled
      >
        {reason}
      </Button>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={() => setIsOpen(true)}
      >
        <User className="h-4 w-4 mr-2" />
        Aplicar para Tarefa
      </Button>

      <ApplyTaskModal
        task={task}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onClose={handleClose}
      />
    </>
  )
}
