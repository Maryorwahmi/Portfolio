# Distributed E-Commerce Platform (Microservices Architecture)

This project demonstrates a production-grade, scalable, distributed e-commerce platform using a microservices architecture built with .NET Core, PostgreSQL, RabbitMQ, Redis, and Ocelot API Gateway.

## Core Architecture Principles Implemented

1. **Service-Oriented Architecture**: 3 independent deployable services (`AuthService`, `ProductService`, `OrderService`) and an `ApiGateway`.
2. **Database Per Service**: Each service has its own PostgreSQL database connection string defined in `docker-compose.yml`. No shared databases.
3. **Event-Driven Communication**: Uses MassTransit with RabbitMQ to publish and consume events (`OrderCreated`, `InventoryReserved`, `InventoryFailed`).
4. **API Gateway**: Ocelot is used as the single entry point (`ApiGateway`), routing requests and handling rate limiting.
5. **Eventual Consistency**: The Order Saga manages the distributed transaction. The Order Service creates a pending order, publishes an event, and the Product Service reserves inventory asynchronously.
6. **Fault Tolerance & Retry Mechanisms**: MassTransit automatically handles retries and Dead Letter Queues (DLQ) for failed message processing.

## Advanced Engineering Requirements (Senior-Level Signals)

1. **Idempotency**: Implemented in `OrdersController.cs` using an `IdempotencyKey` to prevent duplicate order creation.
2. **Retry & Dead Letter Queues**: Configured via MassTransit in the service startup (not explicitly shown in the snippets, but standard MassTransit behavior when exceptions are thrown in consumers like `ReserveInventoryConsumer`).
3. **Distributed Transactions (Saga Pattern)**: Implemented using MassTransit State Machine (`OrderSaga.cs`) to orchestrate the order lifecycle (Pending -> Paid -> Shipped -> Completed/Failed).
4. **Caching Layer**: Redis is used in `ProductsController.cs` to cache the product catalog and invalidate it upon new product creation.
5. **Logging & Monitoring**: `ILogger` is used throughout the services. In a full deployment, this would be wired up to Serilog/ELK.
6. **API Security**: JWT validation is handled. The `ApiGateway` can enforce authentication, and controllers use `[Authorize]` attributes with role-based access (e.g., `[Authorize(Roles = "Admin")]` for creating products).

## How to Run Locally

1. Ensure you have Docker and Docker Compose installed.
2. Navigate to the `dotnet-ecommerce` directory.
3. Run the following command to start the infrastructure (PostgreSQL, RabbitMQ, Redis) and the microservices:

```bash
docker-compose up --build
```

4. The API Gateway will be available at `http://localhost:5000`.

## API Endpoints (via Gateway)

- **Auth Service**:
  - `POST http://localhost:5000/auth/register`
  - `POST http://localhost:5000/auth/login`
- **Product Service**:
  - `GET http://localhost:5000/products`
  - `POST http://localhost:5000/products` (Requires Admin JWT)
- **Order Service**:
  - `POST http://localhost:5000/orders` (Requires JWT)
  - `GET http://localhost:5000/orders/{id}` (Requires JWT)

## Note on the AI Studio Environment

The Google AI Studio Build environment is a Node.js/React sandbox. Therefore, you cannot run this .NET/Docker Compose architecture directly in this browser preview. 

**To use this code:**
1. Click the **Settings** gear icon in the top right of the AI Studio UI.
2. Select **Export to ZIP** or **Export to GitHub**.
3. Extract the files on your local machine and run `docker-compose up --build` inside the `dotnet-ecommerce` folder.

To provide a visual representation in this browser preview, a simulated React frontend has been built in the main application window that explains the architecture and visualizes the event flow.
