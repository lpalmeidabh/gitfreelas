'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { Code, GitPullRequest, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

function PublicHeader() {
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
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Code className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">GitFreelas</span>
        </Link>

        {/* Botão de Login */}
        <Button onClick={handleLogin} disabled={isLoggingIn}>
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <GitPullRequest className="w-4 h-4 mr-2" />
              Entrar
            </>
          )}
        </Button>
      </div>
    </header>
  )
}

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Conteúdo das páginas */}
      <main>{children}</main>

      {/* Footer Público */}
      <footer className="border-t py-8 px-4 mt-auto">
        <div className="container mx-auto">
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>© 2025 GitFreelas - Trabalho de Conclusão de Curso</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
