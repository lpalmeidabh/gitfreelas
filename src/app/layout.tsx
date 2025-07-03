import '@/app/globals.css'
import type { Metadata } from 'next'
import { connection } from 'next/server'

export const metadata: Metadata = {
  title: 'git-freelas',
  description: 'GitFreelas',
}

async function UTSSR() {
  await connection()
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      className={`scroll-smooth  antialiased`}
      lang="pt"
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
