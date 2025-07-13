import { AdminControls } from '@/components/dashboard/admin-controls'
import { AdminOverview } from '@/components/dashboard/admin-overview'
import { ContractInfo } from '@/components/dashboard/contract-info'
import { EventLogs } from '@/components/dashboard/event-logs'
import { PerformanceMetrics } from '@/components/dashboard/performance-metrics'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  DollarSign,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

export const metadata = {
  title: 'Dashboard Administrativo | GitFreelas',
  description: 'Painel de controle e monitoramento da plataforma GitFreelas',
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground">
              Monitoramento e controle da plataforma GitFreelas
            </p>
          </div>

          <Badge variant="outline" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Ambiente de Demonstração
          </Badge>
        </div>

        {/* Disclaimer */}
        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Área Demonstrativa:</strong> Em um ambiente de produção,
            esta área seria restrita apenas a administradores da plataforma.
            Aqui você pode visualizar como seria o painel de controle real do
            GitFreelas.
          </AlertDescription>
        </Alert>

        {/* Cards de Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Depositado
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.45 ETH</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasks Ativas
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 criadas hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fees Coletados
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.08 ETH</div>
              <p className="text-xs text-muted-foreground">
                3% de taxa da plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Desenvolvedores
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                5 ativos nas últimas 24h
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="contract" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Contrato
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Controles
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="contract" className="space-y-6">
            <ContractInfo />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics />
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <AdminControls />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <EventLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
