import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { weiToEther } from '@/lib/web3/config'
import { TaskWithRelations } from '@/types'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Wallet,
} from 'lucide-react'

interface TaskSummaryCardProps {
  task: TaskWithRelations
  address?: string
  isConnected: boolean
}

export function TaskSummaryCard({
  task,
  address,
  isConnected,
}: TaskSummaryCardProps) {
  const valueInEth = weiToEther(task.valueInWei)
  const formattedValue = parseFloat(valueInEth).toFixed(4)

  const daysUntilDeadline = Math.ceil(
    (new Date(task.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  )

  const isUrgent = daysUntilDeadline <= 2 && daysUntilDeadline > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{task.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {task.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Valor */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">{formattedValue} ETH</span>
        </div>

        {/* Prazo */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-sm">
            {daysUntilDeadline > 0
              ? `${daysUntilDeadline} dias restantes`
              : 'Prazo vencido'}
          </span>
          {isUrgent && (
            <Badge variant="destructive" className="text-xs">
              Urgente
            </Badge>
          )}
        </div>

        {/* Status da carteira */}
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          {isConnected ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Conectada
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Desconectada
            </Badge>
          )}
        </div>

        {isConnected && address && (
          <p className="text-xs text-muted-foreground mt-2">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
