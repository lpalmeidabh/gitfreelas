// src/hooks/useGitFreelas.ts
import { useReadContract, useWriteContract } from 'wagmi'
import { APP_CONFIG } from '@/lib/web3/config'
import { parseEther } from 'viem'

// Hook para ler dados do contrato
export function useGitFreelasRead() {
  const contract = APP_CONFIG.contracts.gitFreelas

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

  const { data: taskCount } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getTaskCount',
  })

  const { data: overduePeriod } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'OVERDUE_PERIOD',
  })

  return {
    platformFee: platformFee ? Number(platformFee) : 0,
    minimumTaskValue: minimumTaskValue ? minimumTaskValue.toString() : '0',
    taskCount: taskCount ? Number(taskCount) : 0,
    overduePeriod: overduePeriod ? Number(overduePeriod) : 0,
    contractAddress: contract.address,
    isContractConfigured:
      contract.address !== '0x0000000000000000000000000000000000000000',
  }
}

// Hook para criar tasks
export function useCreateTask() {
  const { writeContract, isPending, error, data } = useWriteContract()
  const contract = APP_CONFIG.contracts.gitFreelas

  const createTask = (
    taskId: string,
    deadline: bigint,
    allowOverdue: boolean,
    taskValueInEth: string,
  ) => {
    const taskValue = parseEther(taskValueInEth)
    const platformFee = (taskValue * BigInt(3)) / BigInt(100) // 3%
    const totalValue = taskValue + platformFee

    writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'createTask',
      args: [taskId, deadline, allowOverdue],
      value: totalValue,
    })
  }

  return {
    createTask,
    isPending,
    error,
    transactionHash: data,
  }
}
