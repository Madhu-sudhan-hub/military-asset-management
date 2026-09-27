# MAMS Backend API Documentation

Welcome to the REST API documentation for the Military Asset Management System (MAMS). This document explains the primary endpoints created during Phase 3 to manage master/reference data.

## 1. Overview
The API is built using Spring Boot REST Controllers, following standard RESTful practices. It communicates strictly via JSON.
All APIs sit behind the `/api` prefix.

**Important Error Handling:**
If an error occurs, the API returns a structured JSON response instead of a raw stack trace:
```json
{
  "timestamp": "2026-09-27T10:00:00",
  "status": 404,
  "error": "RESOURCE_NOT_FOUND",
  "message": "Base not found with id: 99",
  "path": "/api/bases/99"
}
```

## 2. Bases API
Endpoints to manage military bases and locations.

* **GET `/api/bases`**
  * Fetches a paginated list of all bases.
  * Parameters: `?page=0&size=10`
* **GET `/api/bases/{id}`**
  * Fetches a single base by its ID.
* **POST `/api/bases`**
  * Creates a new base.
  * Request Body:
    ```json
    {
      "baseCode": "ALPHA-01",
      "baseName": "Base Alpha",
      "location": "North Sector",
      "status": "ACTIVE"
    }
    ```
* **PUT `/api/bases/{id}`**
  * Updates an existing base.
* **DELETE `/api/bases/{id}`**
  * Safely deletes a base. Returns `409 Conflict` or `500 Server Error` if referenced by personnel or assets.

## 3. Personnel API
Manage personnel attached to a base.

* **GET `/api/personnel`**
  * Fetches all personnel.
* **GET `/api/personnel/{id}`**
  * Fetches single personnel. Response includes nested Base data.
* **POST `/api/personnel`**
  * Request Body:
    ```json
    {
      "employeeNumber": "EMP-007",
      "fullName": "James Bond",
      "rank": "Commander",
      "contactNumber": "555-0101",
      "baseId": 1,
      "status": "ACTIVE"
    }
    ```
* **PUT `/api/personnel/{id}`**
* **DELETE `/api/personnel/{id}`**

## 4. Equipment Types API
Manages the master catalog of items.

* **GET `/api/equipment-types`**
* **POST `/api/equipment-types`**
  * Request Body:
    ```json
    {
      "equipmentCode": "VEH-JEEP-01",
      "equipmentName": "Standard Jeep",
      "category": "VEHICLE",
      "trackingType": "INDIVIDUAL",
      "unitOfMeasure": "UNIT"
    }
    ```
    *Note: `category` must be VEHICLE, WEAPON, AMMUNITION, COMMUNICATION, or OTHER. `trackingType` must be INDIVIDUAL or BULK.*
* **PUT `/api/equipment-types/{id}`**
* **DELETE `/api/equipment-types/{id}`**

## 5. Assets API
Manages specifically tracked instances of equipment (Individual tracking only).

* **GET `/api/assets`**
  * Fetches paginated assets. 
  * Supports filtering: `/api/assets?baseId=1` or `/api/assets?equipmentTypeId=2`
* **POST `/api/assets`**
  * Request Body:
    ```json
    {
      "assetTag": "TAG-99281",
      "equipmentTypeId": 1,
      "currentBaseId": 1,
      "serialNumber": "SN-XJ9-992",
      "status": "OPERATIONAL",
      "acquisitionDate": "2026-01-15"
    }
    ```
    *Note: If the `equipmentTypeId` points to a BULK type item (like ammunition), creation will be rejected, as bulk items are tracked by quantity in transactions rather than individual asset records.*
* **PUT `/api/assets/{id}`**
* **DELETE `/api/assets/{id}`**

## 6. Swagger UI
If the backend is running, you can access dynamic documentation via Swagger UI:
`http://localhost:8080/swagger-ui/index.html`
