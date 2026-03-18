# Distributed E-Commerce Platform (Microservices Architecture)

This repository contains a comprehensive demonstration of a modern, distributed e-commerce platform built using a microservices architecture. 

It consists of two main parts:
1. **Interactive Architecture Simulation (React)**: A visual, interactive UI that simulates the event-driven Saga pattern, demonstrating how the microservices communicate asynchronously.
2. **Production-Grade .NET Backend**: The actual source code for the microservices, ready to be run locally via Docker Compose.

## 🌟 Features

- **Microservices Architecture**: Independent services for Auth, Products, Orders, Payments, and Notifications.
- **API Gateway**: Single entry point routing requests to the appropriate microservices (Ocelot).
- **Event-Driven Communication**: Asynchronous messaging using RabbitMQ.
- **Saga Pattern (Distributed Transactions)**: Orchestrated order fulfillment process handling inventory reservation, payment processing, and compensating transactions (rollbacks) on failure.
- **Database per Service**: Each microservice manages its own PostgreSQL database to ensure loose coupling.
- **Caching**: Redis caching for the product catalog to improve read performance.
- **Idempotency**: API endpoints designed to safely handle duplicate requests.
- **Interactive UI**: Real-time visualization of the event stream and service states.

## 🚀 Getting Started

### 1. Running the Interactive Simulation (Web UI)
The React frontend is already running in this environment. It provides a visual representation of the architecture.
- Click **"Simulate Order"** to watch the happy path (Order -> Inventory -> Payment -> Notification).
- Click **"Force Failure"** to watch the compensating transaction path (Order -> Inventory Failed -> Order Failed).
- Click **"Restock Inventory"** to reset the available stock.

### 2. Running the .NET Microservices Locally
To run the actual backend infrastructure, you will need Docker and Docker Compose installed on your local machine.

1. Export this project (Settings -> Export to ZIP).
2. Extract the ZIP file and open a terminal in the extracted directory.
3. Navigate to the backend folder:
   ```bash
   cd dotnet-ecommerce
   ```
4. Start the infrastructure and services:
   ```bash
   docker-compose up --build
   ```
5. The API Gateway will be available at `http://localhost:5000`.

## 🏗️ Architecture Overview

### Services
1. **API Gateway**: Routes incoming HTTP requests to the internal microservices. Handles rate limiting and authentication middleware.
2. **Auth Service**: Manages user registration, login, and JWT token generation.
3. **Product Service**: Manages the product catalog and inventory. Uses Redis for caching.
4. **Order Service**: Manages the order lifecycle. Contains the Saga Orchestrator that coordinates the distributed transaction.
5. **Payment Service**: Processes payments for orders.
6. **Notification Service**: Listens for domain events and sends simulated emails/SMS to users.

### The Order Saga Workflow
1. Client submits an order to the **API Gateway**.
2. Gateway routes to the **Order Service**, which creates a `Pending` order and publishes `OrderCreated`.
3. **Product Service** consumes `OrderCreated`, checks stock.
   - *Success*: Publishes `InventoryReserved`.
   - *Failure*: Publishes `InventoryFailed` (Order Service marks order as `Failed`).
4. **Payment Service** consumes `InventoryReserved`, processes payment.
   - *Success*: Publishes `OrderPaid`.
   - *Failure*: Publishes `PaymentFailed` (Order Service marks order as `Failed` and publishes `ReleaseInventory`).
5. **Order Service** consumes `OrderPaid`, marks order as `Completed`.
6. **Notification Service** listens to these events and sends updates to the user.
