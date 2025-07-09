-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('OPEN', 'APPLIED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED', 'CANCELLED', 'OVERDUE', 'REFUNDED');

-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('DEPOSIT', 'RELEASE', 'REFUND', 'PLATFORM_FEE');

-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "valueInWei" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "allowOverdue" BOOLEAN NOT NULL DEFAULT false,
    "status" "task_status" NOT NULL DEFAULT 'OPEN',
    "contractTaskId" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_developer" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "networkId" TEXT NOT NULL DEFAULT '11155111',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "task_developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_repository" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "repositoryName" TEXT NOT NULL,
    "repositoryUrl" TEXT NOT NULL,
    "githubRepoId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "task_repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_transaction" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "transaction_type" NOT NULL,
    "status" "transaction_status" NOT NULL DEFAULT 'PENDING',
    "txHash" TEXT,
    "blockNumber" INTEGER,
    "gasUsed" TEXT,
    "valueInWei" TEXT NOT NULL,
    "networkId" TEXT NOT NULL DEFAULT '11155111',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "blockchain_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_status_idx" ON "task"("status");

-- CreateIndex
CREATE INDEX "task_deadline_idx" ON "task"("deadline");

-- CreateIndex
CREATE INDEX "task_creatorId_idx" ON "task"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "task_developer_taskId_key" ON "task_developer"("taskId");

-- CreateIndex
CREATE INDEX "task_developer_developerId_idx" ON "task_developer"("developerId");

-- CreateIndex
CREATE INDEX "task_developer_walletAddress_idx" ON "task_developer"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "task_repository_taskId_key" ON "task_repository"("taskId");

-- CreateIndex
CREATE INDEX "task_repository_repositoryName_idx" ON "task_repository"("repositoryName");

-- CreateIndex
CREATE INDEX "blockchain_transaction_taskId_idx" ON "blockchain_transaction"("taskId");

-- CreateIndex
CREATE INDEX "blockchain_transaction_txHash_idx" ON "blockchain_transaction"("txHash");

-- CreateIndex
CREATE INDEX "blockchain_transaction_status_idx" ON "blockchain_transaction"("status");

-- CreateIndex
CREATE INDEX "blockchain_transaction_type_idx" ON "blockchain_transaction"("type");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_developer" ADD CONSTRAINT "task_developer_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_developer" ADD CONSTRAINT "task_developer_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_repository" ADD CONSTRAINT "task_repository_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_transaction" ADD CONSTRAINT "blockchain_transaction_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_transaction" ADD CONSTRAINT "blockchain_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
