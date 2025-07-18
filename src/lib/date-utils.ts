import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Converte uma data para objeto Date de forma segura
 */
export function safeParseDate(date: Date | string | number): Date | null {
  try {
    let parsedDate: Date

    if (date instanceof Date) {
      parsedDate = date
    } else if (typeof date === 'string') {
      parsedDate = parseISO(date)
    } else if (typeof date === 'number') {
      parsedDate = new Date(date)
    } else {
      return null
    }

    return isValid(parsedDate) ? parsedDate : null
  } catch {
    return null
  }
}

/**
 * Formata data para exibição (ex: "15 de jul. de 2024")
 */
export function formatDateDisplay(date: Date | string | number): string {
  const parsedDate = safeParseDate(date)
  if (!parsedDate) return 'Data inválida'

  return format(parsedDate, "dd 'de' MMM 'de' yyyy", { locale: ptBR })
}

/**
 * Formata data e hora para exibição (ex: "15 de jul. de 2024 às 14:30")
 */
export function formatDateTimeDisplay(date: Date | string | number): string {
  const parsedDate = safeParseDate(date)
  if (!parsedDate) return 'Data inválida'

  return format(parsedDate, "dd 'de' MMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  })
}

/**
 * Formata distância temporal (ex: "há 2 dias", "em 3 horas")
 */
export function formatTimeDistance(date: Date | string | number): string {
  const parsedDate = safeParseDate(date)
  if (!parsedDate) return 'Data inválida'

  return formatDistanceToNow(parsedDate, {
    addSuffix: true,
    locale: ptBR,
  })
}

/**
 * Verifica se uma data já passou (está no passado)
 */
export function isDateOverdue(date: Date | string | number): boolean {
  const parsedDate = safeParseDate(date)
  if (!parsedDate) return false

  return new Date() > parsedDate
}

/**
 * Calcula dias até uma data (negativo se já passou)
 */
export function getDaysUntilDate(date: Date | string | number): number | null {
  const parsedDate = safeParseDate(date)
  if (!parsedDate) return null

  const diffTime = parsedDate.getTime() - new Date().getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Verifica se uma data está próxima (dentro de X dias)
 */
export function isDateUrgent(
  date: Date | string | number,
  daysThreshold = 3,
): boolean {
  const daysUntil = getDaysUntilDate(date)
  if (daysUntil === null) return false

  return daysUntil <= daysThreshold && daysUntil > 0
}
