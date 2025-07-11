import { TaskList } from '@/components/tasks/task-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getTasks, getMyTasks } from '@/actions/tasks'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  User,
} from 'lucide-react'
import { weiToEther } from '@/lib/web3/config'
import { TaskStatus } from '@/lib/generated/prisma/client'

export const metadata = {
  title: 'Tarefas Disponíveis | GitFreelas',
  description: 'Encontre tarefas de desenvolvimento e ganhe em cripto',
}

interface TasksPageProps {
  searchParams: {
    tab?: string
    status?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  // Verificar autenticação
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/')
  }

  const currentTab = searchParams.tab || 'available'
  const currentUserId = session.user.id

  // Buscar dados baseado na aba atual
  let availableTasksData = null
  let myTasksData = null

  if (currentTab === 'available') {
    // Tarefas disponíveis (abertas)
    const filters = {
      status: [TaskStatus.OPEN],
      search: searchParams.search,
    }

    const sort = (searchParams.sort as any) || 'newest'
    const page = parseInt(searchParams.page || '1')

    availableTasksData = await getTasks(filters, sort, page, 10)
  } else if (currentTab === 'my-tasks') {
    // Minhas tarefas (criadas + aplicadas)
    myTasksData = await getMyTasks()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
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

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tarefas Abertas
                  </p>
                  <p className="text-2xl font-bold">
                    {availableTasksData?.total || '...'}
                  </p>
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
                  <p className="text-sm text-muted-foreground">Valor Médio</p>
                  <p className="text-2xl font-bold">0.15 ETH</p>
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

        {/* Abas principais */}
        <Tabs value={currentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="available" asChild>
              <Link
                href="/tasks?tab=available"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Tarefas Disponíveis
              </Link>
            </TabsTrigger>
            <TabsTrigger value="my-tasks" asChild>
              <Link
                href="/tasks?tab=my-tasks"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Minhas Tarefas
              </Link>
            </TabsTrigger>
          </TabsList>

          {/* Tarefas Disponíveis */}
          <TabsContent value="available" className="space-y-6">
            {availableTasksData ? (
              <TaskList
                initialData={availableTasksData}
                currentUserId={currentUserId}
                showFilters={true}
                title="Tarefas Disponíveis"
                description="Tarefas abertas aguardando desenvolvedores. Aplique-se agora!"
              />
            ) : (
              <TaskList
                currentUserId={currentUserId}
                showFilters={true}
                title="Tarefas Disponíveis"
                description="Tarefas abertas aguardando desenvolvedores. Aplique-se agora!"
              />
            )}
          </TabsContent>

          {/* Minhas Tarefas */}
          <TabsContent value="my-tasks" className="space-y-6">
            {myTasksData ? (
              <div className="space-y-8">
                {/* Tarefas que criei */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold">Tarefas que Criei</h2>
                    <Badge variant="secondary">
                      {myTasksData.createdTasks.length}
                    </Badge>
                  </div>

                  {myTasksData.createdTasks.length > 0 ? (
                    <div className="space-y-4">
                      {myTasksData.createdTasks.map((task) => (
                        <div key={task.id}>
                          {/* Renderizar TaskCard aqui - TODO: importar TaskCard */}
                          <Card>
                            <CardContent className="p-4">
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge>{task.status}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {parseFloat(
                                    weiToEther(task.valueInWei),
                                  ).toFixed(4)}{' '}
                                  ETH
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          Nenhuma tarefa criada
                        </h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Comece criando sua primeira tarefa para encontrar
                          desenvolvedores
                        </p>
                        <Link href="/tasks/create">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeira Tarefa
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Tarefas em que me apliquei */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold">
                      Tarefas em que me Apliquei
                    </h2>
                    <Badge variant="secondary">
                      {myTasksData.appliedTasks.length}
                    </Badge>
                  </div>

                  {myTasksData.appliedTasks.length > 0 ? (
                    <div className="space-y-4">
                      {myTasksData.appliedTasks.map((task) => (
                        <div key={task.id}>
                          <Card>
                            <CardContent className="p-4">
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge>{task.status}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {parseFloat(
                                    weiToEther(task.valueInWei),
                                  ).toFixed(4)}{' '}
                                  ETH
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          Nenhuma aplicação ainda
                        </h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Explore as tarefas disponíveis e aplique-se para
                          começar a ganhar
                        </p>
                        <Link href="/tasks?tab=available">
                          <Button variant="outline">
                            <Search className="h-4 w-4 mr-2" />
                            Explorar Tarefas
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
