-- Reconciliation migration: captures schema drift from direct DB modifications.
-- All changes below already exist in the database; this migration exists only
-- to bring the migration history in sync with the actual schema.
-- Marked as applied — SQL is replayed by Prisma for drift detection but not re-executed.

-- ReviewerProfile: add hospitalId, status (title/institution/phone/yearsOfExperience already in 20260809115653)
ALTER TABLE `reviewerprofile` ADD COLUMN `hospitalId` VARCHAR(191) NULL;
ALTER TABLE `reviewerprofile` ADD COLUMN `status` VARCHAR(191) NULL;
CREATE INDEX `ReviewerProfile_hospitalId_idx` ON `reviewerprofile`(`hospitalId`);
CREATE INDEX `ReviewerProfile_status_idx` ON `reviewerprofile`(`status`);
ALTER TABLE `reviewerprofile` ADD CONSTRAINT `ReviewerProfile_hospitalId_fkey` FOREIGN KEY (`hospitalId`) REFERENCES `HospitalProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ApplicationDocument: widen verification enum to include REQUIRES_UPDATE, REJECTED
ALTER TABLE `applicationdocument` MODIFY COLUMN `verification` ENUM('PENDING', 'VERIFIED', 'NEEDS_ATTENTION', 'REQUIRES_UPDATE', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- PartnerRegistration: add reviewMessage, widen status enum to include INFO_REQUESTED
ALTER TABLE `partnerregistration` ADD COLUMN `reviewMessage` TEXT NULL;
ALTER TABLE `partnerregistration` MODIFY COLUMN `status` ENUM('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'INFO_REQUESTED') NOT NULL DEFAULT 'PENDING';

-- StudentDocument: add metadata columns
ALTER TABLE `studentdocument` ADD COLUMN `fileSize` INTEGER NULL;
ALTER TABLE `studentdocument` ADD COLUMN `mimeType` VARCHAR(191) NULL;
ALTER TABLE `studentdocument` ADD COLUMN `note` VARCHAR(191) NULL;
ALTER TABLE `studentdocument` ADD COLUMN `rejectedAt` DATETIME(3) NULL;
ALTER TABLE `studentdocument` ADD COLUMN `rejectedById` VARCHAR(191) NULL;
ALTER TABLE `studentdocument` ADD COLUMN `storagePath` VARCHAR(191) NULL;
ALTER TABLE `studentdocument` ADD COLUMN `storageProvider` VARCHAR(191) NULL;
ALTER TABLE `studentdocument` ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1;
