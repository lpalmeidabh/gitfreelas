import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
} from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Balance da carteira conectada
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  })

  // Verificar se está na rede correta
  const isWrongNetwork = isConnected && chainId !== sepolia.id

  // Conectar carteira
  const handleConnect = useCallback(async () => {
    try {
      // Tentar diferentes IDs do MetaMask
      const metaMaskConnector = connectors.find(
        (connector) =>
          connector.id === 'metaMask' ||
          connector.id === 'io.metamask' ||
          connector.name.toLowerCase().includes('metamask'),
      )

      if (!metaMaskConnector) {
        console.log(
          'Conectores disponíveis:',
          connectors.map((c) => ({ id: c.id, name: c.name })),
        )
        toast.error('MetaMask não encontrada. Por favor, instale a extensão.')
        return
      }

      connect({ connector: metaMaskConnector })
    } catch (error) {
      console.error('Erro ao conectar carteira:', error)
      toast.error('Erro ao conectar carteira')
    }
  }, [connect, connectors])

  // Desconectar carteira
  const handleDisconnect = useCallback(() => {
    disconnect()
    toast.success('Carteira desconectada')
  }, [disconnect])

  // Trocar para rede Sepolia
  const handleSwitchToSepolia = useCallback(async () => {
    try {
      await switchChain({ chainId: sepolia.id })
      toast.success('Rede alterada para Sepolia')
    } catch (error) {
      console.error('Erro ao trocar rede:', error)
      toast.error('Erro ao trocar para rede Sepolia')
    }
  }, [switchChain])

  // Efeitos para tratamento de erros
  useEffect(() => {
    if (connectError) {
      console.error('Erro de conexão:', connectError)
      toast.error('Erro ao conectar carteira')
    }
  }, [connectError])

  // Função para formatar endereço
  const formatAddress = useCallback((addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  // Função para formatar balance
  const formatBalance = useCallback(() => {
    if (!balance) return '0'
    return parseFloat(balance.formatted).toFixed(4)
  }, [balance])

  return {
    // Estado da carteira
    address,
    isConnected,
    isConnecting,
    isWrongNetwork,
    balance,
    isLoadingBalance,
    chainId,

    // Ações
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchToSepolia: handleSwitchToSepolia,

    // Helpers
    formatAddress,
    formatBalance,
  }
}
