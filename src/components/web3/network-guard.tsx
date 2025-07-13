'use client'

import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet, AlertTriangle } from 'lucide-react'
import { APP_CONFIG } from '@/lib/web3/config'
import { WalletConnectButton } from './wallet-connect-button'

interface NetworkGuardProps {
  children: React.ReactNode
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isCorrectNetwork = chainId === APP_CONFIG.defaultChain.id
  const defaultChain = APP_CONFIG.defaultChain

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Wallet não conectada</h3>
        <p className="text-muted-foreground mb-4">
          Conecte sua wallet para continuar
        </p>
        <WalletConnectButton />
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="font-semibold mb-2">Rede incorreta</h3>
        <p className="text-muted-foreground mb-4">
          Troque para a rede {defaultChain.name} para continuar
        </p>
        <Button onClick={() => switchChain({ chainId: defaultChain.id })}>
          Trocar para {defaultChain.name}
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
