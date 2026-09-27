# Military Asset Management System (MAMS) - Database Design

## 1. Overview
The MAMS database is a relational schema built in MySQL, designed to safely track military personnel, equipment types, operational bases, and individual hardware assets.

## 2. Approach: Individual vs. Bulk Equipment Tracking
Military assets range from large vehicles to small ammunition. This database supports both:
- **Individual Tracking (e.g., Vehicles, Weapons):** The `assets` table represents a single physical item uniquely identified by `asset_tag` and `serial_number`. Assignments or transfers reference the `asset_id`.
- **Bulk Tracking (e.g., Ammunition, Rations):** The system relies on `equipment_types` combined with quantities during purchases, transfers, and expenditures. The `asset_id` is left `NULL` for bulk transaction records.

## 3. Balance Calculation Design
We do not store a singular "current_balance" column. A single column would be a single point of failure and subject to race conditions. Instead, inventory is calculated dynamically by tallying operational transactions:
**Closing Balance = (Opening Balance) + (Purchases) + (Transfer In) - (Transfer Out) - (Expenditure)**
*Note: Assignments indicate physical custody of individually tracked equipment and do not affect the calculated base quantity balance.*

## 4. Tables List & Relationships

### `bases`
Physical military locations. 
- **PK:** `base_id`
- **Fields:** base_code (UNIQUE), base_name, location.

### `personnel`
Military staff attached to a base.
- **PK:** `personnel_id`
- **FK:** `base_id` -> bases

### `equipment_types`
Master catalog of equipment. Includes tracking type (INDIVIDUAL vs BULK).
- **PK:** `equipment_type_id`
- **Fields:** category, tracking_type, unit_of_measure.

### `assets`
Specific physical hardware instances.
- **PK:** `asset_id`
- **FK:** `equipment_type_id` -> equipment_types, `current_base_id` -> bases

### `users`, `roles`, `user_roles`
Authentication and Authorization.
- **PKs:** `user_id`, `role_id`
- `user_roles` acts as a many-to-many relationship table linking `users` and `roles`.

### `purchases`
Records the acquisition of assets from suppliers.
- **FK:** `base_id`, `equipment_type_id`, `created_by`

### `transfers` & `transfer_items`
Movement of equipment between bases.
- `transfers` stores the metadata (from base, to base, date).
- `transfer_items` links specific assets or bulk quantities.

### `assignments`
Check-out/Check-in tracking of assets given to personnel.
- **FK:** `asset_id`, `personnel_id`

### `expenditures`
Records when assets are consumed, destroyed, or fully decommissioned.
- **FK:** `base_id`, `equipment_type_id`, `asset_id` (if individual)

### `audit_logs`
Action tracing for security compliance. 
- Tracks what user changed what entity.
