'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@/hooks/useWallet'
import { Wallet, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectWalletProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showBalance?: boolean
  showNetwork?: boolean
  required?: boolean
}

export function ConnectWallet({
  className,
  variant = 'default',
  size = 'default',
  showBalance = true,
  showNetwork = true,
  required = false,
}: ConnectWalletProps) {
  const {
    address,
    isConnected,
    isConnecting,
    isWrongNetwork,
    balance,
    isLoadingBalance,
    connect,
    disconnect,
    switchToSepolia,
    formatAddress,
    formatBalance,
  } = useWallet()

  // Se não está conectado
  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        variant={variant}
        size={size}
        className={cn('gap-2', className)}
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Conectar Carteira
            {required && <span className="text-red-500">*</span>}
          </>
        )}
      </Button>
    )
  }

  // Se está na rede errada
  if (isWrongNetwork) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          onClick={switchToSepolia}
          variant="destructive"
          size={size}
          className="gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Trocar para Sepolia
        </Button>
        <Button onClick={disconnect} variant="outline" size={size}>
          Desconectar
        </Button>
      </div>
    )
  }

  // Se está conectado corretamente
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm font-medium">{formatAddress(address!)}</span>
        </div>

        {showBalance && (
          <Badge variant="outline" className="gap-1">
            {isLoadingBalance ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              `${formatBalance()} ETH`
            )}
          </Badge>
        )}

        {showNetwork && <Badge variant="secondary">Sepolia</Badge>}
      </div>

      <Button onClick={disconnect} variant="outline" size={size}>
        Desconectar
      </Button>
    </div>
  )
}
