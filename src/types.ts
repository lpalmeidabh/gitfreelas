// Adicionar no src/types.ts

import {
  TaskStatus,
  TransactionType,
  TransactionStatus,
} from '@/lib/generated/prisma/client'

// ===== TASK TYPES =====

export type Task = {
  id: string
  title: string
  description: string
  requirements?: string
  valueInWei: string
  deadline: Date
  allowOverdue: boolean
  status: TaskStatus
  contractTaskId?: string
  creatorId: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export type TaskWithRelations = Task & {
  creator: {
    id: string
    name: string
    email: string
    image?: string
  }
  taskDeveloper?: {
    id: string
    developerId: string
    walletAddress: string
    appliedAt: Date
    acceptedAt?: Date
    developer: {
      id: string
      name: string
      email: string
      image?: string
    }
  }
  repository?: {
    id: string
    repositoryName: string
    repositoryUrl: string
    isActive: boolean
    createdAt: Date
  }
  transactions: BlockchainTransaction[]
}

export type TaskDeveloper = {
  id: string
  taskId: string
  developerId: string
  walletAddress: string
  networkId: string
  appliedAt: Date
  acceptedAt?: Date
}

export type TaskRepository = {
  id: string
  taskId: string
  repositoryName: string
  repositoryUrl: string
  githubRepoId?: number
  isActive: boolean
  createdAt: Date
  deletedAt?: Date
}

export type BlockchainTransaction = {
  id: string
  taskId: string
  userId?: string
  type: TransactionType
  status: TransactionStatus
  txHash?: string
  blockNumber?: number
  gasUsed?: string
  valueInWei: string
  networkId: string
  errorMessage?: string
  createdAt: Date
  confirmedAt?: Date
}

// ===== FORM TYPES =====

export type CreateTaskData = {
  title: string
  description: string
  requirements?: string
  valueInEther: string // Para o formulário em Ether
  deadline: Date
  allowOverdue: boolean
}

export type CreateTaskErrors = {
  title?: string
  description?: string
  requirements?: string
  valueInEther?: string
  deadline?: string
  allowOverdue?: string
}

export type ApplyTaskData = {
  taskId: string
  walletAddress: string
  acceptTerms: boolean
}

// ===== API RESPONSE TYPES =====

export type TaskListResponse = {
  tasks: TaskWithRelations[]
}

export type TaskDetailsResponse = TaskWithRelations

// ===== FILTER/QUERY TYPES =====

export type TaskFilters = {
  status?: TaskStatus[]
  minValue?: string // em Wei
  maxValue?: string // em Wei
  deadline?: {
    from?: Date
    to?: Date
  }
  creatorId?: string
  search?: string
}

export type TaskSortOptions =
  | 'newest'
  | 'oldest'
  | 'highest_value'
  | 'lowest_value'
  | 'deadline_soon'

// ===== COMPONENT PROPS TYPES =====

export type TaskCardProps = {
  task: TaskWithRelations
  showActions?: boolean
  variant?: 'default' | 'compact'
}

export type TaskListProps = {
  filters?: TaskFilters
  sort?: TaskSortOptions
  limit?: number
  showPagination?: boolean
}

// ===== UTILITY TYPES =====

export type TaskStatusLabel = {
  [K in TaskStatus]: {
    label: string
    color: string
    icon: string
  }
}

export type TransactionTypeLabel = {
  [K in TransactionType]: {
    label: string
    color: string
  }
}

// ===== CONSTANTS =====

export const TASK_STATUS_LABELS: TaskStatusLabel = {
  OPEN: { label: 'Aberta', color: 'text-blue-600', icon: 'circle' },
  APPLIED: { label: 'Aplicada', color: 'text-yellow-600', icon: 'clock' },
  IN_PROGRESS: {
    label: 'Em Andamento',
    color: 'text-orange-600',
    icon: 'play',
  },
  PENDING_APPROVAL: {
    label: 'Aguardando Aprovação',
    color: 'text-purple-600',
    icon: 'pause',
  },
  COMPLETED: { label: 'Concluída', color: 'text-green-600', icon: 'check' },
  CANCELLED: { label: 'Cancelada', color: 'text-gray-600', icon: 'x' },
  OVERDUE: { label: 'Vencida', color: 'text-red-600', icon: 'alert-triangle' },
  REFUNDED: { label: 'Reembolsada', color: 'text-indigo-600', icon: 'undo' },
}

export const TRANSACTION_TYPE_LABELS: TransactionTypeLabel = {
  DEPOSIT: { label: 'Depósito', color: 'text-green-600' },
  RELEASE: { label: 'Liberação', color: 'text-blue-600' },
  REFUND: { label: 'Reembolso', color: 'text-orange-600' },
  PLATFORM_FEE: { label: 'Taxa da Plataforma', color: 'text-purple-600' },
}

// ===== VALIDATION SCHEMAS (para uso com zod) =====

export const CREATE_TASK_SCHEMA = {
  title: { min: 3, max: 100 },
  description: { min: 10, max: 2000 },
  requirements: { max: 1000 },
  valueInEther: { min: 0.001, max: 100 },
  deadline: { minDaysFromNow: 1, maxDaysFromNow: 365 },
}

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 50,
}
