'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CheckCircle2, X } from 'lucide-react'

interface SuccessNotificationProps {
  message: string
  details?: string
  onClose?: () => void
  autoHide?: boolean
  duration?: number
}

export function SuccessNotification({
  message,
  details,
  onClose,
  autoHide = true,
  duration = 5000,
}: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoHide, duration, onClose])

  if (!isVisible) return null

  return (
    <Alert className="border-green-200 bg-green-50 fixed top-4 right-4 z-50 max-w-md shadow-lg">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <div className="space-y-2">
          <p className="font-medium">{message}</p>
          {details && <p className="text-sm text-green-700">{details}</p>}
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="absolute top-2 right-2 h-6 w-6 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
