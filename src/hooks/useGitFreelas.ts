'use client'

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { APP_CONFIG } from '@/lib/web3/config'
import { useState, useEffect } from 'react'

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
// READ HOOKS - Informações do Contrato
// ============================================================================

/**
 * Hook para ler configurações e estatísticas do contrato
 */
export function useGitFreelasRead() {
  const contract = APP_CONFIG.contracts.gitFreelas

  // Configurações básicas
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

  return {
    // Configurações
    platformFee: platformFee ? Number(platformFee) : 3, // 3% default
    minimumTaskValue: minimumTaskValue || BigInt(0),
    minimumTaskValueEth: minimumTaskValue ? formatEther(minimumTaskValue) : '0',
    overduePeriod: overduePeriod ? Number(overduePeriod) : 3, // 3 days default

    // Estatísticas
    platformStats,
    taskCount: taskCount ? Number(taskCount) : 0,

    // Utilities
    contractAddress: contract.address,
    isContractConfigured:
      contract.address !== '0x0000000000000000000000000000000000000000',

    // Refetch functions
    refetchStats,
    refetchTaskCount,
  }
}

/**
 * Hook para buscar uma task específica
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

// ============================================================================
// WRITE HOOKS - Interações com o Contrato
// ============================================================================

/**
 * Hook para criar tasks no contrato
 */
export function useCreateTask() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const contract = APP_CONFIG.contracts.gitFreelas
  const [isConfirming, setIsConfirming] = useState(false)

  // Aguardar confirmação da transação
  const { isLoading: isWaitingConfirm, isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    setIsConfirming(isWaitingConfirm)
  }, [isWaitingConfirm])

  const createTask = async (
    taskId: string,
    deadlineTimestamp: number,
    allowOverdue: boolean,
    taskValueInEth: string,
  ) => {
    try {
      const taskValue = parseEther(taskValueInEth)
      const platformFee = (taskValue * BigInt(3)) / BigInt(100) // 3%
      const totalValue = taskValue + platformFee

      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'createTask',
        args: [taskId, BigInt(deadlineTimestamp), allowOverdue],
        value: totalValue,
      })
    } catch (err) {
      console.error('Erro ao criar task:', err)
      throw err
    }
  }

  return {
    createTask,
    isPending,
    isConfirming,
    isSuccess,
    error,
    transactionHash: hash,
  }
}

/**
 * Hook para aplicar em tasks
 */
export function useApplyToTask() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const contract = APP_CONFIG.contracts.gitFreelas
  const [isConfirming, setIsConfirming] = useState(false)

  const { isLoading: isWaitingConfirm, isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    setIsConfirming(isWaitingConfirm)
  }, [isWaitingConfirm])

  const applyToTask = async (taskId: string) => {
    try {
      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'applyToTask',
        args: [taskId],
      })
    } catch (err) {
      console.error('Erro ao aplicar na task:', err)
      throw err
    }
  }

  return {
    applyToTask,
    isPending,
    isConfirming,
    isSuccess,
    error,
    transactionHash: hash,
  }
}

/**
 * Hook para completar tasks (apenas cliente)
 */
export function useCompleteTask() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const contract = APP_CONFIG.contracts.gitFreelas
  const [isConfirming, setIsConfirming] = useState(false)

  const { isLoading: isWaitingConfirm, isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    setIsConfirming(isWaitingConfirm)
  }, [isWaitingConfirm])

  const completeTask = async (taskId: string) => {
    try {
      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'completeTask',
        args: [taskId],
      })
    } catch (err) {
      console.error('Erro ao completar task:', err)
      throw err
    }
  }

  return {
    completeTask,
    isPending,
    isConfirming,
    isSuccess,
    error,
    transactionHash: hash,
  }
}

/**
 * Hook para cancelar tasks (apenas cliente, antes de aplicação)
 */
export function useCancelTask() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const contract = APP_CONFIG.contracts.gitFreelas
  const [isConfirming, setIsConfirming] = useState(false)

  const { isLoading: isWaitingConfirm, isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    setIsConfirming(isWaitingConfirm)
  }, [isWaitingConfirm])

  const cancelTask = async (taskId: string, reason: string) => {
    try {
      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'cancelTask',
        args: [taskId, reason],
      })
    } catch (err) {
      console.error('Erro ao cancelar task:', err)
      throw err
    }
  }

  return {
    cancelTask,
    isPending,
    isConfirming,
    isSuccess,
    error,
    transactionHash: hash,
  }
}

/**
 * Hook para solicitar conclusão (desenvolvedor sinaliza que terminou)
 */
export function useRequestTaskCompletion() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const contract = APP_CONFIG.contracts.gitFreelas
  const [isConfirming, setIsConfirming] = useState(false)

  const { isLoading: isWaitingConfirm, isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    setIsConfirming(isWaitingConfirm)
  }, [isWaitingConfirm])

  const requestCompletion = async (taskId: string) => {
    try {
      writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'requestTaskCompletion',
        args: [taskId],
      })
    } catch (err) {
      console.error('Erro ao solicitar conclusão:', err)
      throw err
    }
  }

  return {
    requestCompletion,
    isPending,
    isConfirming,
    isSuccess,
    error,
    transactionHash: hash,
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook para calcular valores de task incluindo fees
 */
export function useTaskCalculations() {
  const { platformFee } = useGitFreelasRead()

  const calculateTaskCosts = (taskValueInEth: string) => {
    try {
      const taskValue = parseEther(taskValueInEth)
      const platformFeeAmount = (taskValue * BigInt(platformFee)) / BigInt(100)
      const totalDeposit = taskValue + platformFeeAmount

      return {
        taskValue,
        platformFeeAmount,
        totalDeposit,
        taskValueEth: formatEther(taskValue),
        platformFeeEth: formatEther(platformFeeAmount),
        totalDepositEth: formatEther(totalDeposit),
      }
    } catch {
      return {
        taskValue: BigInt(0),
        platformFeeAmount: BigInt(0),
        totalDeposit: BigInt(0),
        taskValueEth: '0',
        platformFeeEth: '0',
        totalDepositEth: '0',
      }
    }
  }

  return {
    calculateTaskCosts,
    platformFee,
  }
}

/**
 * Hook para verificar permissões do usuário
 */
export function useTaskPermissions(task: TaskData | undefined) {
  const { address } = useAccount()

  const isClient =
    task && address && task.client.toLowerCase() === address.toLowerCase()
  const isDeveloper =
    task && address && task.developer.toLowerCase() === address.toLowerCase()
  const canApply =
    task &&
    address &&
    task.status === 1 && // DEPOSITED
    task.client.toLowerCase() !== address.toLowerCase() // Não é o cliente
  const canComplete = isClient && task?.status === 2 // ACTIVE
  const canCancel = isClient && task?.status === 1 // DEPOSITED
  const canRequestCompletion =
    isDeveloper && (task?.status === 2 || task?.status === 3) // ACTIVE ou OVERDUE

  return {
    isClient,
    isDeveloper,
    canApply,
    canComplete,
    canCancel,
    canRequestCompletion,
    isConnected: !!address,
    userAddress: address,
  }
}

// ============================================================================
// COMBINED HOOK - Tudo em um só lugar
// ============================================================================

/**
 * Hook principal que combina todas as funcionalidades
 */
export function useGitFreelas(taskId?: string) {
  const readData = useGitFreelasRead()
  const taskData = useGetTask(taskId || '')
  const createTask = useCreateTask()
  const applyToTask = useApplyToTask()
  const completeTask = useCompleteTask()
  const cancelTask = useCancelTask()
  const requestCompletion = useRequestTaskCompletion()
  const calculations = useTaskCalculations()
  const permissions = useTaskPermissions(taskData.task)

  return {
    // Read data
    ...readData,

    // Task specific
    ...taskData,

    // Write operations
    createTask: createTask.createTask,
    applyToTask: applyToTask.applyToTask,
    completeTask: completeTask.completeTask,
    cancelTask: cancelTask.cancelTask,
    requestCompletion: requestCompletion.requestCompletion,

    // States
    isCreating: createTask.isPending || createTask.isConfirming,
    isApplying: applyToTask.isPending || applyToTask.isConfirming,
    isCompleting: completeTask.isPending || completeTask.isConfirming,
    isCanceling: cancelTask.isPending || cancelTask.isConfirming,
    isRequesting: requestCompletion.isPending || requestCompletion.isConfirming,

    // Success states
    createSuccess: createTask.isSuccess,
    applySuccess: applyToTask.isSuccess,
    completeSuccess: completeTask.isSuccess,
    cancelSuccess: cancelTask.isSuccess,
    requestSuccess: requestCompletion.isSuccess,

    // Errors
    createError: createTask.error,
    applyError: applyToTask.error,
    completeError: completeTask.error,
    cancelError: cancelTask.error,
    requestError: requestCompletion.error,

    // Transaction hashes
    createTx: createTask.transactionHash,
    applyTx: applyToTask.transactionHash,
    completeTx: completeTask.transactionHash,
    cancelTx: cancelTask.transactionHash,
    requestTx: requestCompletion.transactionHash,

    // Utilities
    ...calculations,
    ...permissions,
  }
}
