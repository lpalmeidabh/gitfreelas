// src/components/tasks/listing/tasks-stats.tsx

import { Card, CardContent } from '@/components/ui/card'
import { Search, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export function TasksStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarefas Abertas</p>
              <p className="text-2xl font-bold">42</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">12.5 ETH</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-md">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prazo Médio</p>
              <p className="text-2xl font-bold">7 dias</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md">
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
              <p className="text-2xl font-bold">94%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
