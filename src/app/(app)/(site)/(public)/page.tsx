'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import {
  BookCheck,
  CheckCircle,
  Contact,
  GitBranch,
  Github,
  GitPullRequest,
  Info,
  Loader2,
  Scroll,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

export default function HomePage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async () => {
    setIsLoggingIn(true)
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard',
      })
    } catch (error) {
      console.error('Erro no login:', error)
      setIsLoggingIn(false)
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="destructive" className="mb-6">
            Trabalho de conclusão do Legal HackBuilders
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            GitFreelas
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A primeira plataforma de freelancers que conecta clientes e
            desenvolvedores com <strong>pagamentos em cripto</strong> para maior
            <strong> segurança e transparência</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <GitPullRequest className="w-5 h-5 mr-2" />
                  Começar com GitHub
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Como Funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                1. Cliente posta tarefa
              </h3>
              <p className="text-muted-foreground">
                Descreve o projeto, define valor em ETH e prazo. Neste momento,
                o valor é travado em um smart contract.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Dev se aplica</h3>
              <p className="text-muted-foreground">
                Desenvolvedor se canditada e, no momento em que é escolhido, ele
                recebe acesso ao repositório GitHub para começar o trabalho.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Contact className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                3. Cliente escolhe o dev
              </h3>
              <p className="text-muted-foreground">
                Cliente aceita a candidatura do desenvolvedor e o repositório
                GitHub é criado automaticamente temndo o dev como colaborador.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                4. Dev trabalha na tarefa
              </h3>
              <p className="text-muted-foreground">
                Desenvolvedor trabalha na tarefa e ao concluí-la, ele envia um
                pull request para o cliente revisar.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scroll className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                5. Tarefa aprovada e pagamento automatizado
              </h3>
              <p className="text-muted-foreground">
                Assim que o cliente aprova a conclusão da tarefa, o pagamento é
                liberado automaticamente e os tokens saem do contrato, direto
                para a carteira do desenvolvedor.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                6. Cliente recebe o código
              </h3>
              <p className="text-muted-foreground">
                Ao final, o cliente recebe acesso ao repositorio com todo o
                código da tarefa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Por que GitFreelas?</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Pagamentos Seguros</h3>
                    <p className="text-muted-foreground text-sm">
                      Smart contracts garantem que o dinheiro só é liberado após
                      aprovação
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Repositórios Automáticos</h3>
                    <p className="text-muted-foreground text-sm">
                      GitHub repos criados automaticamente quando projeto inicia
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Sem Intermediários</h3>
                    <p className="text-muted-foreground text-sm">
                      Pagamento direto desenvolvedor ↔ cliente via blockchain
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GitPullRequest className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Integração GitHub</h3>
                    <p className="text-muted-foreground text-sm">
                      Login via GitHub, repos automáticos, pull requests
                      integrados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-muted-foreground mb-8">
            Entre com sua conta GitHub e comece a encontrar projetos ou publicar
            suas tarefas hoje mesmo.
          </p>

          <Button size="lg" onClick={handleLogin} disabled={isLoggingIn}>
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <GitPullRequest className="w-5 h-5 mr-2" />
                Entrar com GitHub
              </>
            )}
          </Button>
        </div>
      </section>
    </>
  )
}
