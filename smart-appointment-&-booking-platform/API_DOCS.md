# Smart Appointment & Booking Platform API

This document outlines the API endpoints for the Smart Appointment & Booking Platform MVP.

## Base URL
\`http://localhost:3000/api\`

---

## Endpoints

### 1. Get All Providers
Retrieve a list of all service providers.

- **URL:** \`/providers\`
- **Method:** \`GET\`
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    \`\`\`json
    [
      {
        "id": "p1",
        "user_id": "u1",
        "name": "Dr. Smith Clinic",
        "timezone": "America/New_York"
      }
    ]
    \`\`\`

### 2. Get Available Slots for a Provider
Retrieve all available (unbooked) future time slots for a specific provider.

- **URL:** \`/providers/:id/slots\`
- **Method:** \`GET\`
- **URL Params:**
  - \`id\` (string): Provider ID
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    \`\`\`json
    [
      {
        "id": "s1",
        "provider_id": "p1",
        "start_time": "2023-10-25T14:00:00.000Z",
        "end_time": "2023-10-25T15:00:00.000Z",
        "is_booked": 0
      }
    ]
    \`\`\`

### 3. Get User Appointments
Retrieve all appointments for a specific user.

- **URL:** \`/users/:id/appointments\`
- **Method:** \`GET\`
- **URL Params:**
  - \`id\` (string): User ID
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    \`\`\`json
    [
      {
        "id": "a123456789",
        "slot_id": "s1",
        "client_id": "u2",
        "status": "booked",
        "created_at": "2023-10-24T10:00:00.000Z",
        "start_time": "2023-10-25T14:00:00.000Z",
        "end_time": "2023-10-25T15:00:00.000Z",
        "provider_name": "Dr. Smith Clinic"
      }
    ]
    \`\`\`

### 4. Create an Appointment (Booking)
Book a specific time slot for a user. This endpoint uses database transactions and unique constraints to prevent double-booking.

- **URL:** \`/appointments\`
- **Method:** \`POST\`
- **Data Params:**
  \`\`\`json
  {
    "slot_id": "s1",
    "client_id": "u2"
  }
  \`\`\`
- **Success Response:**
  - **Code:** 201 Created
  - **Content:** \`{ "id": "a123456789", "message": "Appointment booked successfully" }\`
- **Error Responses:**
  - **Code:** 409 Conflict (Double Booking)
  - **Content:** \`{ "error": "This slot has already been booked. Please choose another." }\`
  - **Code:** 400 Bad Request
  - **Content:** \`{ "error": "slot_id and client_id are required" }\`

### 5. Cancel an Appointment
Cancel an existing appointment and free up the associated time slot.

- **URL:** \`/appointments/:id\`
- **Method:** \`PATCH\`
- **URL Params:**
  - \`id\` (string): Appointment ID
- **Data Params:**
  \`\`\`json
  {
    "status": "cancelled"
  }
  \`\`\`
- **Success Response:**
  - **Code:** 200 OK
  - **Content:** \`{ "message": "Appointment cancelled successfully" }\`
- **Error Responses:**
  - **Code:** 400 Bad Request
  - **Content:** \`{ "error": "Active appointment not found" }\`

---

## Concurrency Testing
To run the automated concurrency test that demonstrates the prevention of double-booking, run the following command in the terminal:

\`\`\`bash
npm run test
\`\`\`

This script simulates 10 concurrent booking requests for the same time slot and verifies that only 1 succeeds while the other 9 are rejected with a 409 Conflict status.
