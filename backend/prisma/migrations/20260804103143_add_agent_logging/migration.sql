-- CreateTable
CREATE TABLE `AgentConversation` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `resultingBookingId` VARCHAR(191) NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AgentConversation_userId_idx`(`userId`),
    INDEX `AgentConversation_startedAt_idx`(`startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentToolCall` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `toolName` VARCHAR(100) NOT NULL,
    `input` JSON NOT NULL,
    `output` JSON NULL,
    `status` ENUM('SUCCESS', 'ERROR') NOT NULL,
    `errorMessage` TEXT NULL,
    `durationMs` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AgentToolCall_conversationId_idx`(`conversationId`),
    INDEX `AgentToolCall_userId_idx`(`userId`),
    INDEX `AgentToolCall_toolName_idx`(`toolName`),
    INDEX `AgentToolCall_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AgentConversation` ADD CONSTRAINT `AgentConversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgentToolCall` ADD CONSTRAINT `AgentToolCall_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `AgentConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgentToolCall` ADD CONSTRAINT `AgentToolCall_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
