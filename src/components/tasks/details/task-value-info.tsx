'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, ExternalLink } from 'lucide-react'
import { getEtherscanUrl } from '@/lib/web3/etherscan'
import { weiToEther } from '@/lib/web3/config'

interface TaskValueInfoProps {
  valueInWei: string
  contractTaskId?: string
}

export function TaskValueInfo({
  valueInWei,
  contractTaskId,
}: TaskValueInfoProps) {
  const formatValue = weiToEther(valueInWei)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          Valor da Tarefa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatValue} ETH
          </div>
          <p className="text-muted-foreground">
            ≈ ${(parseFloat(formatValue) * 2000).toFixed(2)} USD
          </p>
        </div>

        {contractTaskId && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Transação de Criação
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Depósito registrado na blockchain
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(getEtherscanUrl(contractTaskId), '_blank')
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Etherscan
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Taxa da Plataforma</p>
            <p className="text-sm font-medium">3%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Depositado</p>
            <p className="text-sm font-medium text-green-600">
              {(parseFloat(formatValue) * 1.03).toFixed(4)} ETH
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
