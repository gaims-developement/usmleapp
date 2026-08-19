ALTER TABLE `Notification` ADD COLUMN `documentId` VARCHAR(191) NULL;

CREATE INDEX `Notification_documentId_idx` ON `Notification`(`documentId`);

ALTER TABLE `Notification`
  ADD CONSTRAINT `Notification_documentId_fkey`
  FOREIGN KEY (`documentId`) REFERENCES `StudentDocument`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
