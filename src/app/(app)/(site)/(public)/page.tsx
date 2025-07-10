'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Zap,
  Github,
  CheckCircle,
  Users,
  Wallet,
  Loader2,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
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
          <Badge variant="outline" className="mb-6">
            🚀 Plataforma em desenvolvimento - TCC
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Freelancers em Crypto
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A primeira plataforma de freelancers que conecta clientes e
            desenvolvedores com <strong>pagamentos em cripto</strong> e{' '}
            <strong>repositórios automáticos</strong>.
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
                  <Github className="w-5 h-5 mr-2" />
                  Começar com GitHub
                </>
              )}
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Ver Como Funciona
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
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                1. Cliente Posta Tarefa
              </h3>
              <p className="text-muted-foreground">
                Descreve o projeto, define valor em ETH e prazo. O valor fica
                seguro em smart contract.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Dev se Aplica</h3>
              <p className="text-muted-foreground">
                Desenvolvedor conecta carteira, se aplica e recebe acesso
                automático ao repositório GitHub.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                3. Pagamento Automático
              </h3>
              <p className="text-muted-foreground">
                Após aprovação, o pagamento é liberado automaticamente via smart
                contract. Sem intermediários.
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
                  <Github className="w-5 h-5 text-gray-600 mt-1" />
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

            <div className="bg-muted/30 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Tecnologias</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>• Next.js 15</div>
                <div>• TypeScript</div>
                <div>• Solidity</div>
                <div>• GitHub API</div>
                <div>• Ethereum</div>
                <div>• Prisma ORM</div>
                <div>• Tailwind CSS</div>
                <div>• Better Auth</div>
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
                <Github className="w-5 h-5 mr-2" />
                Entrar com GitHub
              </>
            )}
          </Button>
        </div>
      </section>
    </>
  )
}
