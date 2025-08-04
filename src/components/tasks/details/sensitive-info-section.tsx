'use client'

import { Badge } from '@/components/ui/badge'
import type { TaskWithRelations } from '@/types'
import { Link, Paperclip, Lock } from 'lucide-react'

interface SensitiveInfoSectionProps {
  task: TaskWithRelations
  currentUserId?: string
}

export function SensitiveInfoSection({
  task,
  currentUserId,
}: SensitiveInfoSectionProps) {
  // Verificar se o usuário atual tem acesso aos links e anexos
  const hasAccessToSensitiveInfo = () => {
    // Cliente sempre tem acesso
    if (currentUserId === task.creatorId) {
      return true
    }

    // Desenvolvedor escolhido tem acesso
    if (
      task.taskDeveloper &&
      currentUserId === task.taskDeveloper.developerId
    ) {
      return true
    }

    // Apenas se a tarefa está em progresso ou concluída
    return ['IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED'].includes(
      task.status,
    )
  }

  const hasAccess = hasAccessToSensitiveInfo()

  return (
    <>
      {/* Links - Apenas para usuários autorizados */}
      {task.links && task.links.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Link className="h-4 w-4" />
            Links Relacionados
            {!hasAccess && (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Apenas para desenvolvedor escolhido
              </Badge>
            )}
          </h4>
          {hasAccess ? (
            <div className="space-y-2">
              {task.links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 break-all"
                    >
                      {link.url}
                    </a>
                    {link.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <p className="text-sm">
                  {task.links.length} link{task.links.length !== 1 ? 's' : ''}{' '}
                  disponível{task.links.length !== 1 ? 'is' : ''} após ser
                  escolhido como desenvolvedor
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Anexos - Apenas para usuários autorizados */}
      {task.attachments && task.attachments.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Anexos
            {!hasAccess && (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Apenas para desenvolvedor escolhido
              </Badge>
            )}
          </h4>
          {hasAccess ? (
            <div className="space-y-2">
              {task.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 break-all"
                    >
                      {attachment.name}
                    </a>
                    {attachment.size && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <p className="text-sm">
                  {task.attachments.length} anexo
                  {task.attachments.length !== 1 ? 's' : ''} disponível
                  {task.attachments.length !== 1 ? 'is' : ''} após ser escolhido
                  como desenvolvedor
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
