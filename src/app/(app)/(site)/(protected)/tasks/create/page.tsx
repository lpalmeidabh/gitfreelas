import { CreateTaskForm } from '@/components/tasks/create-task-form'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, Plus, Lightbulb, Clock, Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Criar Nova Tarefa | GitFreelas',
  description:
    'Publique uma nova tarefa e encontre desenvolvedores qualificados',
}

export default async function CreateTaskPage() {
  // Verificar autenticação
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/tasks">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Plus className="h-8 w-8" />
              Criar Nova Tarefa
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descreva sua tarefa, defina o valor e o prazo. Nossa plataforma
              conectará você com desenvolvedores qualificados que trabalham com
              pagamento em cripto.
            </p>
          </div>
        </div>

        {/* Informações importantes */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Pagamento Seguro</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                O valor é depositado em smart contract e liberado apenas após
                sua aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Entrega Garantida</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Desenvolvedores se comprometem com prazos. Repositório criado
                automaticamente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                <h3 className="font-medium">Qualidade</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Desenvolvedores são avaliados pela comunidade. Apenas perfis
                verificados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dicas para criar uma boa tarefa */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Dicas para uma Tarefa de Sucesso
            </CardTitle>
            <CardDescription>
              Siga essas recomendações para atrair os melhores desenvolvedores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✓ Faça isso:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Seja específico sobre os requisitos técnicos</li>
                  <li>• Inclua exemplos ou referências visuais</li>
                  <li>• Defina prazos realistas (mínimo 1 dia)</li>
                  <li>• Estabeleça critérios claros de aprovação</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">✗ Evite isso:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Descrições vagas como "site bonito"</li>
                  <li>• Prazos impossíveis ou muito apertados</li>
                  <li>• Valores muito baixos para o escopo</li>
                  <li>• Requisitos que mudam constantemente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        <CreateTaskForm />

        {/* Footer com informações adicionais */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">
            Como funciona após criar a tarefa:
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              1. <strong>Depósito:</strong> O valor (+ 3% de taxa) é depositado
              no smart contract
            </p>
            <p>
              2. <strong>Aplicações:</strong> Desenvolvedores se aplicam e você
              escolhe o melhor
            </p>
            <p>
              3. <strong>Desenvolvimento:</strong> Repositório é criado
              automaticamente no GitHub
            </p>
            <p>
              4. <strong>Entrega:</strong> Desenvolvedor cria Pull Request para
              sua aprovação
            </p>
            <p>
              5. <strong>Pagamento:</strong> Após aprovação, o valor é liberado
              automaticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
