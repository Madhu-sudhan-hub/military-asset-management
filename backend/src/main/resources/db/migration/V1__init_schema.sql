-- Flyway V1 Migration: MAMS Base Schema
-- Engineered for MySQL 8+ with UTF8MB4

CREATE TABLE `bases` (
  `base_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `commander_name` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'ACTIVE',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`base_id`),
  UNIQUE KEY `UK_bases_name` (`name`),
  INDEX `idx_bases_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `personnel` (
  `personnel_id` bigint NOT NULL AUTO_INCREMENT,
  `base_id` bigint NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `rank` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'ACTIVE',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`personnel_id`),
  KEY `FK_personnel_base` (`base_id`),
  INDEX `idx_personnel_rank` (`rank`),
  CONSTRAINT `FK_personnel_base` FOREIGN KEY (`base_id`) REFERENCES `bases` (`base_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `equipment_types` (
  `equipment_type_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'ACTIVE',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`equipment_type_id`),
  UNIQUE KEY `UK_equipment_types_name` (`name`),
  INDEX `idx_equipment_types_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assets` (
  `asset_id` bigint NOT NULL AUTO_INCREMENT,
  `equipment_type_id` bigint NOT NULL,
  `base_id` bigint NOT NULL,
  `asset_tag` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT 'AVAILABLE',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`asset_id`),
  UNIQUE KEY `UK_assets_tag` (`asset_tag`),
  KEY `FK_assets_equipment_type` (`equipment_type_id`),
  KEY `FK_assets_base` (`base_id`),
  INDEX `idx_assets_status` (`status`),
  CONSTRAINT `FK_assets_base` FOREIGN KEY (`base_id`) REFERENCES `bases` (`base_id`),
  CONSTRAINT `FK_assets_equipment_type` FOREIGN KEY (`equipment_type_id`) REFERENCES `equipment_types` (`equipment_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `base_id` bigint DEFAULT NULL,
  `personnel_id` bigint DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT 'ACTIVE',
  `last_login_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK_users_username` (`username`),
  UNIQUE KEY `UK_users_email` (`email`),
  KEY `FK_users_base` (`base_id`),
  KEY `FK_users_personnel` (`personnel_id`),
  CONSTRAINT `FK_users_base` FOREIGN KEY (`base_id`) REFERENCES `bases` (`base_id`),
  CONSTRAINT `FK_users_personnel` FOREIGN KEY (`personnel_id`) REFERENCES `personnel` (`personnel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `role_id` bigint NOT NULL AUTO_INCREMENT,
  `role_name` varchar(255) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `UK_roles_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FK_user_roles_role` (`role_id`),
  CONSTRAINT `FK_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  CONSTRAINT `FK_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `purchases` (
  `purchase_id` bigint NOT NULL AUTO_INCREMENT,
  `base_id` bigint NOT NULL,
  `equipment_type_id` bigint NOT NULL,
  `created_by` bigint NOT NULL,
  `supplier` varchar(255) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_cost` double DEFAULT NULL,
  `total_cost` double DEFAULT NULL,
  `purchase_date` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`purchase_id`),
  KEY `FK_purchases_base` (`base_id`),
  KEY `FK_purchases_equipment_type` (`equipment_type_id`),
  KEY `FK_purchases_user` (`created_by`),
  INDEX `idx_purchases_date` (`purchase_date`),
  CONSTRAINT `FK_purchases_base` FOREIGN KEY (`base_id`) REFERENCES `bases` (`base_id`),
  CONSTRAINT `FK_purchases_equipment_type` FOREIGN KEY (`equipment_type_id`) REFERENCES `equipment_types` (`equipment_type_id`),
  CONSTRAINT `FK_purchases_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `transfers` (
  `transfer_id` bigint NOT NULL AUTO_INCREMENT,
  `from_base_id` bigint NOT NULL,
  `to_base_id` bigint NOT NULL,
  `created_by` bigint NOT NULL,
  `completed_by` bigint DEFAULT NULL,
  `status` varchar(255) DEFAULT 'PENDING',
  `reference_number` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `transfer_date` datetime(6) DEFAULT NULL,
  `completion_date` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`transfer_id`),
  KEY `FK_transfers_from_base` (`from_base_id`),
  KEY `FK_transfers_to_base` (`to_base_id`),
  KEY `FK_transfers_created_by` (`created_by`),
  INDEX `idx_transfers_status` (`status`),
  CONSTRAINT `FK_transfers_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FK_transfers_from_base` FOREIGN KEY (`from_base_id`) REFERENCES `bases` (`base_id`),
  CONSTRAINT `FK_transfers_to_base` FOREIGN KEY (`to_base_id`) REFERENCES `bases` (`base_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `transfer_items` (
  `transfer_item_id` bigint NOT NULL AUTO_INCREMENT,
  `transfer_id` bigint NOT NULL,
  `equipment_type_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`transfer_item_id`),
  KEY `FK_transfer_items_transfer` (`transfer_id`),
  KEY `FK_transfer_items_equipment_type` (`equipment_type_id`),
  CONSTRAINT `FK_transfer_items_equipment_type` FOREIGN KEY (`equipment_type_id`) REFERENCES `equipment_types` (`equipment_type_id`),
  CONSTRAINT `FK_transfer_items_transfer` FOREIGN KEY (`transfer_id`) REFERENCES `transfers` (`transfer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignments` (
  `assignment_id` bigint NOT NULL AUTO_INCREMENT,
  `asset_id` bigint NOT NULL,
  `personnel_id` bigint NOT NULL,
  `assigned_by` bigint NOT NULL,
  `returned_by` bigint DEFAULT NULL,
  `status` varchar(255) DEFAULT 'ACTIVE',
  `notes` varchar(255) DEFAULT NULL,
  `assigned_date` datetime(6) DEFAULT NULL,
  `return_date` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`assignment_id`),
  KEY `FK_assignments_asset` (`asset_id`),
  KEY `FK_assignments_personnel` (`personnel_id`),
  KEY `FK_assignments_assigned_by` (`assigned_by`),
  INDEX `idx_assignments_status` (`status`),
  CONSTRAINT `FK_assignments_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`),
  CONSTRAINT `FK_assignments_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FK_assignments_personnel` FOREIGN KEY (`personnel_id`) REFERENCES `personnel` (`personnel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `expenditures` (
  `expenditure_id` bigint NOT NULL AUTO_INCREMENT,
  `base_id` bigint NOT NULL,
  `equipment_type_id` bigint NOT NULL,
  `asset_id` bigint DEFAULT NULL,
  `created_by` bigint NOT NULL,
  `quantity` int NOT NULL,
  `reason` varchar(255) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `expenditure_date` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`expenditure_id`),
  KEY `FK_expenditures_base` (`base_id`),
  KEY `FK_expenditures_equipment_type` (`equipment_type_id`),
  KEY `FK_expenditures_asset` (`asset_id`),
  KEY `FK_expenditures_created_by` (`created_by`),
  INDEX `idx_expenditures_reason` (`reason`),
  CONSTRAINT `FK_expenditures_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`),
  CONSTRAINT `FK_expenditures_base` FOREIGN KEY (`base_id`) REFERENCES `bases` (`base_id`),
  CONSTRAINT `FK_expenditures_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FK_expenditures_equipment_type` FOREIGN KEY (`equipment_type_id`) REFERENCES `equipment_types` (`equipment_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `audit_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `entity_type` varchar(255) NOT NULL,
  `entity_id` bigint DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`audit_id`),
  KEY `FK_audit_logs_user` (`user_id`),
  INDEX `idx_audit_logs_action` (`action`),
  INDEX `idx_audit_logs_entity` (`entity_type`, `entity_id`),
  INDEX `idx_audit_logs_created_at` (`created_at`),
  CONSTRAINT `FK_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Seed Data
INSERT IGNORE INTO `roles` (`role_name`) VALUES ('ADMIN'), ('BASE_COMMANDER'), ('LOGISTICS_OFFICER');
