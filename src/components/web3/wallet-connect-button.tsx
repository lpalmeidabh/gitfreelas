'use client'

import { useState } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
} from 'wagmi'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  LogOut,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { APP_CONFIG } from '@/lib/web3/config'

export function WalletConnectButton() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Se não conectado, mostrar opções de conexão
  if (!isConnected) {
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2"
            disabled={isConnecting || isPending}
          >
            {isConnecting || isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {isConnecting || isPending ? 'Conectando...' : 'Conectar Wallet'}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Escolha sua wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.uid}
              onClick={() => {
                connect({ connector })
                setIsDropdownOpen(false)
              }}
              disabled={isPending}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold">
                    {connector.name.charAt(0)}
                  </span>
                </div>
                {connector.name}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Se conectado, mostrar dropdown com informações
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {address?.slice(0, 6)}...{address?.slice(-4)}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <WalletDropdownContent
          address={address!}
          onDisconnect={() => {
            disconnect()
            toast.success('Wallet desconectada com sucesso')
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function WalletDropdownContent({
  address,
  onDisconnect,
}: {
  address: string
  onDisconnect: () => void
}) {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Buscar saldo ETH
  const { data: balance } = useBalance({
    address: address as `0x${string}`,
  })

  // Verificar se está na rede correta (usando defaultChain)
  const isCorrectNetwork = chainId === APP_CONFIG.defaultChain.id
  const defaultChain = APP_CONFIG.defaultChain

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      toast.success('Endereço copiado para a área de transferência')
    } catch (error) {
      toast.error('Não foi possível copiar o endereço')
    }
  }

  const viewOnExplorer = () => {
    const explorerUrl = defaultChain.blockExplorers?.default?.url
    if (explorerUrl) {
      window.open(`${explorerUrl}/address/${address}`, '_blank')
    }
  }

  const handleSwitchNetwork = () => {
    switchChain({ chainId: defaultChain.id })
  }

  return (
    <div className="p-2">
      {/* Network Status */}
      <div className="mb-3">
        {isCorrectNetwork ? (
          <Badge variant="secondary" className="w-full justify-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {defaultChain.name}
          </Badge>
        ) : (
          <div className="space-y-2">
            <Badge
              variant="destructive"
              className="w-full justify-center gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              Rede incorreta
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={handleSwitchNetwork}
            >
              Trocar para {defaultChain.name}
            </Button>
          </div>
        )}
      </div>

      {/* Address and Balance */}
      <div className="space-y-2 mb-3">
        <div className="text-sm">
          <div className="text-muted-foreground">Endereço:</div>
          <div className="font-mono text-xs break-all">{address}</div>
        </div>

        {balance && (
          <div className="text-sm">
            <div className="text-muted-foreground">Saldo:</div>
            <div className="font-semibold">
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </div>
          </div>
        )}
      </div>

      <DropdownMenuSeparator />

      {/* Actions */}
      <div className="mt-2 space-y-1">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="h-4 w-4 mr-2" />
          Copiar endereço
        </DropdownMenuItem>

        <DropdownMenuItem onClick={viewOnExplorer} className="cursor-pointer">
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver no Explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onDisconnect}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Desconectar
        </DropdownMenuItem>
      </div>
    </div>
  )
}
