// src/components/tasks/listing/tasks-sidebar.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WalletStatusCard } from '@/components/web3/wallet-status-card'
import Link from 'next/link'

export function TasksSidebar() {
  return (
    <div className="space-y-6">
      {/* Status da Carteira */}
      <WalletStatusCard />

      {/* Estatísticas Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suas Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Tarefas Concluídas
            </span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Taxa de Sucesso
            </span>
            <span className="font-medium">0%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Ganho</span>
            <span className="font-medium">0.0000 ETH</span>
          </div>
        </CardContent>
      </Card>

      {/* Links Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links Rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Dashboard
            </Button>
          </Link>
          <Link href="/tasks/create">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Criar Tarefa
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Perfil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
