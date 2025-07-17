import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { ApplyStep } from '@/hooks/tasks/useApplyToTask'
import { CheckCircle2, Database, Loader2, PenTool } from 'lucide-react'

interface ProcessingApplicationProps {
  currentStep: ApplyStep
}

export function ProcessingApplication({
  currentStep,
}: ProcessingApplicationProps) {
  const getProgressPercentage = () => {
    switch (currentStep) {
      case 'signing':
        return 50
      case 'submitting':
        return 85
      default:
        return 0
    }
  }

  const getStepStatus = (step: 'signing' | 'submitting') => {
    if (step === 'signing') {
      return currentStep === 'signing'
        ? 'current'
        : currentStep === 'submitting'
        ? 'completed'
        : 'pending'
    }
    if (step === 'submitting') {
      return currentStep === 'submitting' ? 'current' : 'pending'
    }
    return 'pending'
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Processando Aplicação
        </DialogTitle>
        <DialogDescription>
          Aguarde enquanto processamos sua aplicação...
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1: Assinatura */}
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              currentStep === 'signing'
                ? 'bg-blue-50 border-blue-200'
                : getStepStatus('signing') === 'completed'
                ? 'bg-green-50 border-green-200'
                : 'bg-muted/50',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full',
                currentStep === 'signing'
                  ? 'bg-blue-600 text-white'
                  : getStepStatus('signing') === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {currentStep === 'signing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : getStepStatus('signing') === 'completed' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <PenTool className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">Assinatura Digital</p>
              <p className="text-xs text-muted-foreground">
                {currentStep === 'signing'
                  ? 'Confirme a assinatura na sua carteira...'
                  : getStepStatus('signing') === 'completed'
                  ? 'Assinatura confirmada com sucesso'
                  : 'Assinar aplicação digitalmente'}
              </p>
            </div>
          </div>

          {/* Step 2: Submissão */}
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              currentStep === 'submitting'
                ? 'bg-blue-50 border-blue-200'
                : getStepStatus('submitting') === 'completed'
                ? 'bg-green-50 border-green-200'
                : 'bg-muted/50',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full',
                currentStep === 'submitting'
                  ? 'bg-blue-600 text-white'
                  : getStepStatus('submitting') === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {currentStep === 'submitting' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : getStepStatus('submitting') === 'completed' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Database className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">Salvando Aplicação</p>
              <p className="text-xs text-muted-foreground">
                {currentStep === 'submitting'
                  ? 'Salvando no banco de dados...'
                  : getStepStatus('submitting') === 'completed'
                  ? 'Aplicação salva com sucesso'
                  : 'Registrar aplicação no sistema'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
