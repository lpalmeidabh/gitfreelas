'use client'

import { useAccount, useBalance, useChainId } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APP_CONFIG } from '@/lib/web3/config'
import { useGitFreelasRead } from '@/hooks/useGitFreelas'

export function DebugWallet() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { contractAddress, isContractConfigured } = useGitFreelasRead()

  // Tentar buscar balance com diferentes configurações
  const {
    data: balance,
    isError,
    isLoading,
    error,
  } = useBalance({
    address: address as `0x${string}`,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch a cada 5 segundos
    },
  })

  // Balance forçando Sepolia
  const { data: sepoliaBalance } = useBalance({
    address: address as `0x${string}`,
    chainId: 11155111, // Forçar Sepolia
    query: {
      enabled: !!address,
    },
  })

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Wallet não conectada</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Debug Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div>
            <strong>Endereço:</strong> {address}
          </div>
          <div>
            <strong>Chain ID Atual:</strong> {chainId}
          </div>
          <div>
            <strong>Sepolia Chain ID:</strong> {APP_CONFIG.defaultChain.id}
          </div>
          <div>
            <strong>Rede Correta:</strong>{' '}
            {chainId === APP_CONFIG.defaultChain.id ? (
              <Badge variant="secondary">✅ Sim</Badge>
            ) : (
              <Badge variant="destructive">❌ Não</Badge>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Balance Debug:</h4>
          <div className="space-y-1 text-sm">
            <div>
              <strong>Is Loading:</strong> {isLoading ? 'Sim' : 'Não'}
            </div>
            <div>
              <strong>Is Error:</strong> {isError ? 'Sim' : 'Não'}
            </div>
            {error && (
              <div>
                <strong>Error:</strong> {error.message}
              </div>
            )}
            <div>
              <strong>Balance (auto chain):</strong>{' '}
              {balance ? `${balance.formatted} ${balance.symbol}` : 'null'}
            </div>
            <div>
              <strong>Balance (forçado Sepolia):</strong>{' '}
              {sepoliaBalance
                ? `${sepoliaBalance.formatted} ${sepoliaBalance.symbol}`
                : 'null'}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Contrato Debug:</h4>
          <div className="space-y-1 text-sm">
            <div>
              <strong>Endereço:</strong> {contractAddress}
            </div>
            <div>
              <strong>Configurado:</strong>{' '}
              {isContractConfigured ? (
                <Badge variant="secondary">✅ Sim</Badge>
              ) : (
                <Badge variant="destructive">❌ Não</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Config Debug:</h4>
          <div className="space-y-1 text-sm font-mono text-xs">
            <div>
              <strong>RPC URL:</strong>{' '}
              {process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
                ? 'Alchemy configurado'
                : 'RPC público'}
            </div>
            <div>
              <strong>Contract Address:</strong>{' '}
              {process.env.NEXT_PUBLIC_GITFREELAS_CONTRACT_ADDRESS}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
