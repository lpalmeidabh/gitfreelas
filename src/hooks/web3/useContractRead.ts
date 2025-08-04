'use client'

import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { APP_CONFIG } from '@/lib/web3/config'

// ============================================================================
// TYPES
// ============================================================================

export interface TaskData {
  taskId: string
  client: string
  developer: string
  value: bigint
  deadline: bigint
  allowOverdue: boolean
  status: number // TaskStatus enum
  createdAt: bigint
  completedAt: bigint
}

export interface PlatformStats {
  totalTasks: bigint
  completedTasks: bigint
  cancelledTasks: bigint
  totalValueProcessed: bigint
  platformFeesCollected: bigint
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para ler configurações e estatísticas do contrato GitFreelas
 */
export function useGitFreelasRead() {
  const contract = APP_CONFIG.contracts.gitFreelas

  // Configurações básicas do contrato
  const { data: platformFee } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'PLATFORM_FEE_PERCENTAGE',
  })

  const { data: minimumTaskValue } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'MINIMUM_TASK_VALUE',
  })

  const { data: overduePeriod } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'OVERDUE_PERIOD',
  })

  const { data: overduePenaltyPerDay } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'OVERDUE_PENALTY_PER_DAY',
  })

  // Estatísticas da plataforma
  const { data: platformStats, refetch: refetchStats } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getPlatformStats',
  }) as { data: PlatformStats | undefined; refetch: () => void }

  // Contador total de tasks
  const { data: taskCount, refetch: refetchTaskCount } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getTaskCount',
  })

  // Taxas disponíveis para saque
  const { data: availablePlatformFees } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getAvailablePlatformFees',
  })

  return {
    // Configurações do contrato
    platformFee: platformFee ? Number(platformFee) : 3, // 3% default
    minimumTaskValue: minimumTaskValue || BigInt(0),
    minimumTaskValueEth: minimumTaskValue ? formatEther(minimumTaskValue) : '0',
    overduePeriod: overduePeriod ? Number(overduePeriod) : 3, // 3 days default
    overduePenaltyPerDay: overduePenaltyPerDay
      ? Number(overduePenaltyPerDay)
      : 10, // 10% default

    // Estatísticas
    platformStats,
    taskCount: taskCount ? Number(taskCount) : 0,
    availablePlatformFees: availablePlatformFees || BigInt(0),
    availablePlatformFeesEth: availablePlatformFees
      ? formatEther(availablePlatformFees)
      : '0',

    // Funções de refetch
    refetchStats,
    refetchTaskCount,

    // Status do contrato
    isContractConfigured: !!(contract.address && platformFee),
    contractAddress: contract.address,
  }
}

/**
 * Hook para buscar uma task específica por ID
 */
export function useGetTask(taskId: string) {
  const contract = APP_CONFIG.contracts.gitFreelas

  const {
    data: task,
    refetch,
    isLoading,
    error,
  } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getTaskByTaskId',
    args: [taskId],
    query: {
      enabled: !!taskId,
    },
  }) as {
    data: TaskData | undefined
    refetch: () => void
    isLoading: boolean
    error: Error | null
  }

  return {
    task,
    refetch,
    isLoading,
    error,
    // Utilities
    taskExists: !!task,
    taskValueEth: task ? formatEther(task.value) : '0',
    deadlineDate: task ? new Date(Number(task.deadline) * 1000) : null,
    isExpired: task ? Date.now() / 1000 > Number(task.deadline) : false,
  }
}

// Re-export para compatibilidade
export { useGitFreelasRead as useContractRead }
