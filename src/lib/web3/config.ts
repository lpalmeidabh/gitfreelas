// src/lib/web3/config.ts
import { http, createConfig } from 'wagmi'
import { sepolia, localhost } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'
import { GitFreelasABI } from './abis/GitFreelas'
import { GitFreelasTokenABI } from './abis/GitFreelasToken'

// Pegar variáveis do .env
const contractAddress =
  process.env.NEXT_PUBLIC_GITFREELAS_CONTRACT_ADDRESS ||
  '0x75eB05f61dF28263453C3Bf5E01F14772e2DC288'
const gftTokenAddress =
  process.env.NEXT_PUBLIC_GFT_TOKEN_ADDRESS ||
  '0x165634C521a8A35584c20fe533f76DA3fAA6287C'
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

// Validação básica
if (!contractAddress) {
  console.warn('⚠️ NEXT_PUBLIC_GITFREELAS_CONTRACT_ADDRESS não configurado')
}

// Configuração das redes
export const config = createConfig({
  chains: [sepolia, localhost],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'GitFreelas',
        url:
          typeof window !== 'undefined'
            ? window.location.origin
            : 'https://gitfreelas.vercel.app',
        iconUrl:
          typeof window !== 'undefined'
            ? `${window.location.origin}/favicon.ico`
            : 'https://gitfreelas.vercel.app/favicon.ico',
      },
    }),
  ],
  transports: {
    // Usar Alchemy se disponível, senão RPC público
    [sepolia.id]: http(
      alchemyKey
        ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`
        : undefined,
    ),
    [localhost.id]: http(), // Para desenvolvimento local com Foundry
  },
})

// Tipos para usar no resto da aplicação
export type Config = typeof config

// Configurações da aplicação
export const APP_CONFIG = {
  // Rede padrão
  defaultChain: sepolia,

  // Endereços dos contratos (agora vem do .env)
  contracts: {
    gitFreelas: {
      address: contractAddress as `0x${string}`,
      abi: GitFreelasABI, // Agora importa a ABI real
    },
    gftToken: {
      address: gftTokenAddress as `0x${string}`,
      abi: GitFreelasTokenABI,
    },
  },

  // Configurações da plataforma
  platform: {
    feePercentage: 3, // 3% de taxa
    overdueDiscountPerDay: 10, // 10% desconto por dia de atraso
    overdueDays: 3, // 3 dias extras permitidos
  },
} as const

// MANTENDO suas funções úteis existentes:

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

// NOVA: Helper para usar o contrato GitFreelas facilmente
export const useGitFreelasContract = () => {
  return APP_CONFIG.contracts.gitFreelas
}
