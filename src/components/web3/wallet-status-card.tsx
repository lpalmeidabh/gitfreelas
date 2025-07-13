'use client'

import { useAccount, useBalance, useChainId } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, CheckCircle, AlertTriangle } from 'lucide-react'
import { APP_CONFIG } from '@/lib/web3/config'
import { useGitFreelasRead } from '@/hooks/useGitFreelas'
import { WalletConnectButton } from './wallet-connect-button'

export function WalletStatusCard() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { isContractConfigured, contractAddress } = useGitFreelasRead()

  const { data: balance } = useBalance({
    address: address as `0x${string}`,
  })

  const isCorrectNetwork = chainId === APP_CONFIG.defaultChain.id

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Wallet não conectada</h3>
              <p className="text-sm text-muted-foreground">
                Conecte sua wallet para interagir com o GitFreelas
              </p>
            </div>
            <WalletConnectButton />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              Wallet Conectada
            </h3>
            <WalletConnectButton />
          </div>

          {/* Network Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rede:</span>
              {isCorrectNetwork ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {APP_CONFIG.defaultChain.name}
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Incorreta
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contrato:</span>
              {isContractConfigured ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Não encontrado
                </Badge>
              )}
            </div>
          </div>

          {/* Balance */}
          {balance && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Saldo:</span>
                <span className="font-semibold">
                  {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </span>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">Endereço:</div>
            <div className="font-mono text-xs break-all">{address}</div>
          </div>

          {/* Contract Address */}
          {isContractConfigured && (
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                Contrato GitFreelas:
              </div>
              <div className="font-mono text-xs break-all">
                {contractAddress}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
