import '@/app/globals.css'
import { primFont } from '@/fonts'
import { Web3Provider } from '@/lib/web3/providers'
import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import { connection } from 'next/server'

export const metadata: Metadata = {
  title: 'git-freelas',
  description: 'GitFreelas - Freelancers em Crypto',
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
      className={`${primFont.className} scroll-smooth antialiased`}
      lang="pt"
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body suppressHydrationWarning>
        <Web3Provider>
          {children}
          <Toaster />
        </Web3Provider>
      </body>
    </html>
  )
}
