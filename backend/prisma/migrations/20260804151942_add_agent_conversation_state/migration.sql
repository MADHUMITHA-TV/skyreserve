-- AlterTable
ALTER TABLE `agentconversation` ADD COLUMN `historyJson` JSON NULL,
    ADD COLUMN `pendingActionJson` JSON NULL;
