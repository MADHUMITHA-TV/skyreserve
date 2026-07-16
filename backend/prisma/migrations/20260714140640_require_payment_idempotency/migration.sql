/*
  Warnings:

  - Made the column `idempotencyKey` on table `payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `payment` MODIFY `idempotencyKey` VARCHAR(191) NOT NULL;
