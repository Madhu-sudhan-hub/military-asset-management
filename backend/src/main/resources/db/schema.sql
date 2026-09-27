-- Database schema for Military Asset Management System (MAMS)
-- Note: During development, Spring Boot is configured to use Hibernate (spring.jpa.hibernate.ddl-auto=update) 
-- to automatically generate and update the schema based on JPA entities.
-- This file is provided as documentation and for manual setup in production environments.

CREATE DATABASE IF NOT EXISTS mams;
USE mams;

-- 1. Bases
CREATE TABLE bases (
    base_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_code VARCHAR(255) NOT NULL UNIQUE,
    base_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME
);

-- 2. Personnel
CREATE TABLE personnel (
    personnel_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_number VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    rank VARCHAR(100),
    contact_number VARCHAR(100),
    base_id BIGINT,
    status VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (base_id) REFERENCES bases(base_id)
);

-- 3. Equipment Types
CREATE TABLE equipment_types (
    equipment_type_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipment_code VARCHAR(255) NOT NULL UNIQUE,
    equipment_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    tracking_type VARCHAR(50),
    unit_of_measure VARCHAR(50),
    status VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME
);

-- 4. Assets
CREATE TABLE assets (
    asset_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(255) UNIQUE,
    equipment_type_id BIGINT NOT NULL,
    current_base_id BIGINT,
    serial_number VARCHAR(255) UNIQUE,
    status VARCHAR(50),
    acquisition_date DATE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(equipment_type_id),
    FOREIGN KEY (current_base_id) REFERENCES bases(base_id)
);

-- 5. Roles
CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Insert initial roles
INSERT INTO roles (role_name, description) VALUES 
('ADMIN', 'System Administrator'),
('BASE_COMMANDER', 'Base Commander with regional authority'),
('LOGISTICS_OFFICER', 'Logistics Officer managing inventory');

-- 6. Users
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    personnel_id BIGINT,
    base_id BIGINT,
    status VARCHAR(50),
    last_login_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (personnel_id) REFERENCES personnel(personnel_id),
    FOREIGN KEY (base_id) REFERENCES bases(base_id)
);

-- 7. User Roles (Join Table)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 8. Purchases
CREATE TABLE purchases (
    purchase_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    purchase_date DATE NOT NULL,
    supplier VARCHAR(255),
    reference_number VARCHAR(255) UNIQUE,
    unit_cost DECIMAL(12,2),
    total_cost DECIMAL(12,2),
    created_by BIGINT,
    created_at DATETIME,
    FOREIGN KEY (base_id) REFERENCES bases(base_id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(equipment_type_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 9. Transfers
CREATE TABLE transfers (
    transfer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_base_id BIGINT NOT NULL,
    to_base_id BIGINT NOT NULL,
    transfer_date DATETIME,
    reference_number VARCHAR(255) UNIQUE,
    status VARCHAR(50),
    initiated_by BIGINT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (from_base_id) REFERENCES bases(base_id),
    FOREIGN KEY (to_base_id) REFERENCES bases(base_id),
    FOREIGN KEY (initiated_by) REFERENCES users(user_id)
);

-- 10. Transfer Items
CREATE TABLE transfer_items (
    transfer_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transfer_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    asset_id BIGINT,
    quantity INT,
    FOREIGN KEY (transfer_id) REFERENCES transfers(transfer_id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(equipment_type_id),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

-- 11. Assignments
CREATE TABLE assignments (
    assignment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    personnel_id BIGINT NOT NULL,
    assigned_date DATETIME NOT NULL,
    returned_date DATETIME,
    status VARCHAR(50),
    assigned_by BIGINT,
    notes VARCHAR(1000),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
    FOREIGN KEY (personnel_id) REFERENCES personnel(personnel_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

-- 12. Expenditures
CREATE TABLE expenditures (
    expenditure_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    asset_id BIGINT,
    quantity INT NOT NULL,
    expenditure_date DATETIME NOT NULL,
    reason VARCHAR(500),
    reference_number VARCHAR(255),
    recorded_by BIGINT,
    created_at DATETIME,
    FOREIGN KEY (base_id) REFERENCES bases(base_id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(equipment_type_id),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
    FOREIGN KEY (recorded_by) REFERENCES users(user_id)
);

-- 13. Audit Logs
CREATE TABLE audit_logs (
    audit_log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id BIGINT,
    description VARCHAR(1000),
    ip_address VARCHAR(255),
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
