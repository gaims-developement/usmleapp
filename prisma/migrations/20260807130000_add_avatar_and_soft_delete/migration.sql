-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatarUrl` VARCHAR(191) NULL,
    ADD COLUMN `avatarPublicId` VARCHAR(191) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;
