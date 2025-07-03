'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { useActionState } from 'react'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={async () => {
              await authClient.signIn.social({
                provider: 'github',
                callbackURL: '/dashboard',
              })
            }}
            variant="outline"
            className="w-full"
            type="button"
          >
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
