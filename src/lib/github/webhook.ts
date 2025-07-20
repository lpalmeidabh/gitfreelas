// src/lib/github/webhook.ts
import crypto from 'crypto'
import { githubConfig } from './client'

/**
 * Verifica a assinatura do webhook GitHub
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
): Promise<boolean> {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', githubConfig.webhookSecret)
      .update(payload, 'utf8')
      .digest('hex')

    const providedSignature = signature.replace('sha256=', '')

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex'),
    )
  } catch (error) {
    console.error('Erro ao verificar signature do webhook:', error)
    return false
  }
}
