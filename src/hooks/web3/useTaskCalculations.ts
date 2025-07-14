'use client'

import { parseEther, formatEther } from 'viem'

export function useTaskCalculations() {
  const platformFee = 3 // 3% - TODO: pegar do contrato se necessário

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
