'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskApprovalModal } from './task-approval-modal'
import { DeveloperProfileCard } from '@/components/developer-profile-card'
import { TaskWithRelations } from '@/types'

interface TaskApplicationReviewProps {
  task: TaskWithRelations
}

export function TaskApplicationReview({ task }: TaskApplicationReviewProps) {
  const [showModal, setShowModal] = useState(false)

  // Verificar se há desenvolvedor aplicado
  if (!task.taskDeveloper) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              Nenhum desenvolvedor aplicado para esta tarefa.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const developer = task.taskDeveloper.developer

  const handleOpenModal = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Developer Preview Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Aplicação Recebida</h3>
                <Button onClick={handleOpenModal} size="sm">
                  Revisar Aplicação
                </Button>
              </div>

              <DeveloperProfileCard
                developer={developer}
                walletAddress={task.taskDeveloper.walletAddress}
                appliedAt={task.taskDeveloper.appliedAt}
                showBadges={true}
                className="bg-muted/30"
              />

              <div className="text-sm text-muted-foreground">
                <p>
                  💡 <strong>Dica:</strong> Revise cuidadosamente o perfil do
                  desenvolvedor antes de tomar uma decisão. Um repositório será
                  criado automaticamente se você aceitar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-medium">Ação Rápida</h4>
              <div className="flex gap-3">
                <Button onClick={handleOpenModal} className="flex-1" size="lg">
                  Revisar e Decidir
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Aceite ou rejeite esta aplicação através do modal de revisão
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Aprovação */}
      <TaskApprovalModal
        task={task}
        isOpen={showModal}
        onOpenChange={setShowModal}
        onClose={handleCloseModal}
      />
    </>
  )
}
