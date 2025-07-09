import { http, createConfig } from 'wagmi'
import { sepolia, localhost } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

// Configuração das redes
export const config = createConfig({
  chains: [sepolia, localhost],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'GitFreelas',
        url: 'https://gitfreelas.com',
        iconUrl: '/logo.png',
      },
    }),
  ],
  transports: {
    [sepolia.id]: http(), // RPC público da Sepolia
    [localhost.id]: http(), // Para desenvolvimento local com Foundry
  },
})

// Tipos para usar no resto da aplicação
export type Config = typeof config

// Configurações da aplicação
export const APP_CONFIG = {
  // Rede padrão
  defaultChain: sepolia,

  // Endereços dos contratos (será preenchido quando deploy for feito)
  contracts: {
    gitFreelas: {
      address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      abi: [], // ABI será importada quando o contrato estiver pronto
    },
  },

  // Configurações da plataforma
  platform: {
    feePercentage: 3, // 3% de taxa
    overdueDiscountPerDay: 10, // 10% desconto por dia de atraso
    overdueDays: 3, // 3 dias extras permitidos
  },
} as const

// Função helper para converter Wei para Ether
export const weiToEther = (wei: string): string => {
  const weiValue = BigInt(wei)
  const etherValue = Number(weiValue) / Math.pow(10, 18)
  return etherValue.toString()
}

// Função helper para converter Ether para Wei
export const etherToWei = (ether: string): string => {
  const weiValue = BigInt(Math.floor(parseFloat(ether) * Math.pow(10, 18)))
  return weiValue.toString()
}

// Função para validar endereço Ethereum
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
