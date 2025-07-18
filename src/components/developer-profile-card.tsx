'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock, Wallet } from 'lucide-react'
import { formatTimeDistance } from '@/lib/date-utils'

interface DeveloperProfileCardProps {
  developer: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  walletAddress: string
  appliedAt: Date
  showBadges?: boolean
  className?: string
}

export function DeveloperProfileCard({
  developer,
  walletAddress,
  appliedAt,
  showBadges = true,
  className = '',
}: DeveloperProfileCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-16 w-16 flex-shrink-0">
          <AvatarImage
            src={developer.image || undefined}
            alt={developer.name}
          />
          <AvatarFallback className="text-lg">
            {developer.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Developer Info */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Name and Email */}
          <div>
            <h3 className="font-semibold text-lg leading-tight">
              {developer.name}
            </h3>
            <p className="text-muted-foreground text-sm">{developer.email}</p>
          </div>

          {/* Wallet Address */}
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
              {walletAddress}
            </code>
          </div>

          {/* Application Time - USANDO HELPER */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>Aplicou {formatTimeDistance(appliedAt)}</span>
          </div>

          {/* Status Badges */}
          {showBadges && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Aguardando Aprovação</Badge>
              <Badge variant="outline">Carteira Verificada</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
