# Notification Microservice Documentation

## Overview

The **Notification Microservice** is designed to manage and send notifications to organizations when specific events occur in the application. This service is an independent microservice that communicates with the main application via REST API. It is implemented in Flask and interacts with a MongoDB database to store notification data.

---

## Design

### Architecture Diagram

```plaintext
+-------------------+            +--------------------------+
| Main Application  |            | Notification Microservice|
|  (Flask App)      |            |  (Flask App + MongoDB)   |
|                   |            |                          |
|  Users, Orgs,     |   REST API |  Stores and Sends        |
|  Events, etc.     | <--------> |  Notifications           |
+-------------------+            +--------------------------+
```

- The **Main Application** communicates with the **Notification Microservice** using RESTful API calls.
- The microservice is responsible for creating and retrieving notifications from MongoDB.

---

## REST API Endpoints

### Base URL
```
http://<your-server-ip>:5001 
```
**Of course this is assuming you're running it locally**

### Endpoints

#### 1. **Create a Notification**
- **Endpoint:** `/notifications`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "org_id": "<organization_id>",
    "message": "<notification_message>"
  }
  ```
- **Response:**
  - **Success (201):**
    ```json
    {
      "message": "Notification sent successfully",
      "id": "<notification_id>"
    }
    ```
  - **Failure (500):**
    ```json
    {
      "error": "Failed to insert notification"
    }
    ```

#### 2. **Retrieve Notifications**
- **Endpoint:** `/notifications`
- **Method:** `GET`
- **Query Parameters:**
  - `org_id`: Filter notifications by the organization.
- **Response:**
  ```json
  [
    {
      "id": "<notification_id>",
      "organization_id": "<organization_id>",
      "message": "<notification_message>",
      "status": "unread"
    }
  ]
  ```

---

## How It Works in the Application

### Use Case: Registering for an Event
1. **Creating a User**
   - Users are created through the main application using:
     ```bash
     curl -X POST http://<main-app-url>/users/signup -H "Content-Type: application/json" -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123"
     }'
     ```

2. **Creating an Organization**
   - Organizations can sign up using:
     ```bash
     curl -X POST http://<main-app-url>/organizations/signup -H "Content-Type: application/json" -d '{
       "name": "My Organization",
       "email": "org@example.com",
       "password": "securepassword"
     }'
     ```

3. **Creating an Event**
   - Once an organization is created, it can create an event:
     ```bash
     curl -X POST http://<main-app-url>/events -H "Content-Type: application/json" -H "Authorization: Bearer <access_token>" -d '{
       "name": "Volunteer Cleanup",
       "description": "Beach cleanup initiative",
       "date": "2024-12-01"
     }'
     ```

4. **Registering for an Event**
   - Users can register for events using:
     ```bash
     curl -X POST http://<main-app-url>/events/<event_id>/register -H "Content-Type: application/json" -H "Authorization: Bearer <user_access_token>"
     ```

5. **Notification Sent to Organization**
   - When a user registers for an event, the main application sends a POST request to the Notification Microservice:
     ```bash
     curl -X POST http://<notif-service-url>/notifications -H "Content-Type: application/json" -d '{
       "org_id": "<organization_id>",
       "message": "John Doe registered for your Volunteer Cleanup volunteering event."
     }'
     ```

---

## Microservice Characteristics

The Notification Microservice implements the following characteristics of microservices:

1. **Independence**:
   - The service operates independently of the main application and can be deployed, scaled, or updated without affecting other services.

2. **Lightweight Communication**:
   - Communication occurs via RESTful APIs using JSON payloads.

3. **Resilience**:
   - The service retries failed MongoDB operations using the `tenacity` library.

4. **Scalability**:
   - The service can be scaled horizontally if notification load increases.

5. **Focus on a Single Responsibility**:
   - The service is solely responsible for managing notifications.

---

## Data Consistency

### Mechanism:
The service ensures eventual consistency between the main application and the notification system by:
- Relying on the main application to send correct organization and event details.
- Using a retry mechanism for database writes to handle transient issues.

### Challenges:
No strong consistency is enforced since notifications are not critical to the system's operation.

---

## Communication

### Synchronous Communication
- The main application calls the Notification Microservice synchronously via HTTP POST requests.
- If a notification fails, the registration process in the main application rolls back.

---

## Testing the Microservice with `curl`

1. **Create a Notification**:
   ```bash
   curl -X POST http://<notif-service-url>/notifications -H "Content-Type: application/json" -d '{
     "org_id": "648c5f82346b7c001f9ed3d2",
     "message": "Test notification from curl."
   }'
   ```

2. **Retrieve Notifications**:
   ```bash
   curl -X GET http://<notif-service-url>/notifications?org_id=648c5f82346b7c001f9ed3d2
   ```

---