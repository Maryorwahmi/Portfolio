# Portfolio's Overview

# 1 HelixMonitor - Infrastructure Observability Platform

**Created by CaptainCode** - HelixOps Technologies

## 📋 Table of Contents

## 🎯 Overview

HelixMonitor is an **enterprise-grade infrastructure observability platform** designed to provide real-time visibility into system health, application performance, and infrastructure metrics. Built as a mini-alternative to premium tools like Datadog, HelixMonitor enables engineering teams to monitor, visualize, and respond to infrastructure events with professional-grade reliability.

### Key Capabilities

- **Real-time Metrics Collection** - Collect system and application metrics with sub-second precision
- **Time-Series Storage** - Efficient storage and querying of metrics using industry-standard Prometheus
- **Interactive Dashboards** - Modern React-based UI for metrics visualization and analysis
- **Intelligent Alerting** - Rule-based alerts with multiple notification channels
- **Service Monitoring** - Track health status and performance of distributed services
- **Scalable Architecture** - Horizontally scalable metrics collection and processing

---

## ✨ Features

### MVP Features (Implemented)

✅ **Metrics Collection & Ingestion**
- CPU, Memory, Disk I/O, Network metrics
- API latency and request rate tracking
- Error rate and uptime monitoring
- Custom application metrics support

✅ **Time-Series Database**
- Prometheus integration for metrics storage
- Efficient data compression and retention policies
- Sub-minute query latency
- Historical data analysis (5m to 7d+ time ranges)

✅ **System Health Dashboard**
- Real-time metric visualization with charts
- Service health overview
- Performance trends
- Time-range selection (5m, 1h, 24h, 7d)

✅ **Alerting System**
- Rule-based alert evaluation
- Multiple severity levels (info, warning, critical)
- Email and webhook notifications
- Alert acknowledgment and manual resolution

✅ **Service Management**
- Service registration and deregistration
- Heartbeat monitoring
- Health status tracking
- Service metadata management

✅ **Docker Orchestration**
- Complete docker-compose setup
- Health checks for all services
- Persistent data volumes
- Network isolation

✅ **Testing Framework**
- Unit tests for all services
- Integration tests for API endpoints
- Mock data and fixtures
- Async test support

### Advanced Features (Stretch)

🔲 Distributed tracing with OpenTelemetry
🔲 Log aggregation (ELK stack)
🔲 ML-based anomaly detection
🔲 Multi-tenant support
🔲 RBAC and API authentication
🔲 Custom exporter framework

### Component Details

#### **Metrics Collection & Storage**
- **Prometheus**: Time-series metrics database with built-in scraping
- **Node Exporter**: System-level metrics (CPU, memory, disk, network)
- **Custom Exporters**: Application-specific metrics via `/metrics` endpoints
- **Retention**: 15-day retention policy (configurable)

#### **Backend Services** (FastAPI)
- **API Gateway**: RESTful APIs for metrics querying, service management
- **Metrics Service**: Ingestion, aggregation, and statistical analysis
- **Alert Service**: Rule evaluation and notification dispatch
- **Service Registry**: Service metadata and health status tracking

#### **Data Layer**
- **PostgreSQL**: Structured data (services, alert rules, configurations)
- **Redis**: Caching layer and real-time metrics buffer
- **Prometheus TSDB**: Time-series metrics storage

#### **Alerting**
- **AlertManager**: Rule evaluation and alert lifecycle management
- **Notification Channels**: Email (primary), Webhooks (extensible)

#### **Frontend** (React + TypeScript)


# 2 Intelligent AI Service Platform (API-First Architecture)

> A scalable, modular AI-powered backend platform that provides intelligent services via REST APIs. Designed to integrate seamlessly with any product (SaaS apps, e-commerce, dashboards, etc.).

## 🎯 Overview

The **Intelligent AI Service Platform** is a production-ready backend service that brings AI capabilities to any application through well-designed, scalable APIs. It handles:

- **Conversational AI**: Chat endpoints with context awareness
- **Recommendations**: Personalized product, content, and action recommendations
- **Context Management**: Chat history and user preference tracking
- **Semantic Search**: Vector-based memory and retrieval
- **Async Processing**: Background tasks and scheduled jobs

### Key Value Propositions

✅ **Modular Design** - Components work independently or together  
✅ **Plug & Play** - Integrate with any third-party service via REST API  
✅ **Scalable** - Built for high concurrency and throughput  
✅ **Production-Ready** - Error handling, monitoring, and security included  
✅ **Extensible** - Easy to add new AI models and features  

## 🚀 Product Vision

A unified AI backend that:

1. **Accepts** user input (text, context, metadata)
2. **Processes** via AI/ML models and semantic understanding
3. **Returns** structured, actionable responses
4. **Scales** across multiple use cases (chat, recommendations, automation)

### Use Cases

- **Customer Support Chatbots** - Intelligent conversation with context awareness
- **E-Commerce Platforms** - Personalized product recommendations
- **SaaS Applications** - AI-powered user assistance and automation
- **Knowledge Management** - Semantic search and retrieval
- **Content Platforms** - Smart content recommendations

## 🎁 Core Features (MVP)

### 3.1 Conversational AI API (`POST /ai/chat`)

**Features:**
- Context window (10 recent messages)
- Confidence scoring
- Suggested actions
- Token usage tracking

### 3.2 Recommendation Engine (`GET /ai/recommendations`)

Generate personalized recommendations using AI inference.

**Features:**
- Behavior-based recommendations
- Multiple item types (product, content, action)
- Confidence scores
- View tracking

### 3.3 Context & Memory Management

Persistent storage and retrieval of:
- Chat history with messages
- User preferences and metadata
- Session context and state
- Vector embeddings for semantic search

### 3.4 Prompt Orchestration Layer

- Dynamic prompt building with context injection
- Structured JSON output enforcement
- Response shaping and validation
- Multi-model support

### 3.5 AI Model Integration

**Primary:**
- OpenAI GPT-4 and GPT-3.5-turbo

**Optional:**
- Hugging Face Transformers (local inference)
- Custom fine-tuned models

### 3.6 API-First Design

- RESTful architecture
- Comprehensive API documentation (Swagger UI)
- Future GraphQL support
- Versioning ready

## 📚 Tech Stack

### Backend Core
- **FastAPI** 0.104+ - Modern async web framework
- **Pydantic** 2.5 - Data validation and serialization
- **SQLAlchemy** 2.0 - ORM for database
- **Uvicorn** - ASGI server

### AI/ML Layer
- **OpenAI API** - Primary LLM provider
- **LangChain** - LLM orchestration (optional)
- **Hugging Face** - Local model support (optional)

### Data Storage
- **PostgreSQL** 15+ - Structured data
- **Redis** 7+ - Caching and sessions
- **Pinecone** - Vector database for semantic search
  - Alternative: Weaviate, FAISS (local)

### Async & Background Tasks
- **Celery** - Task queue
- **Redis** - Message broker and result backend

### DevOps & Infrastructure
- **Docker** & **Docker Compose** - Containerization
- **Kubernetes** - Orchestration (optional)
- **GitHub Actions** - CI/CD pipeline (optional)

### Monitoring & Logging
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **ELK Stack** - Centralized logging
  - Elasticsearch, Logstash, Kibana

#  3 Multi-Tenant SaaS Platform (Flagship Project)

This repository is a work-in-progress Multi-Tenant SaaS platform built with **.NET (ASP.NET Core)**, **PostgreSQL**, and **React**. It demonstrates tenant isolation (shared DB + `tenant_id`), role-based auth with **ASP.NET Core Identity + JWT**, subscription-ready data models, a Trello-lite project management domain, analytics ingestion, and real-time board updates via SignalR.

## What’s Implemented

### Backend
- **Solution structure**
  - `backend/src/Platform.Core` — domain entities, enums, and abstractions
  - `backend/src/Platform.Infrastructure` — EF Core + Identity + tenant provider
  - `backend/src/Platform.Api` — REST API + JWT auth + SignalR
- **Multi-tenancy (shared DB)**
  - `tenant_id` on tenant-scoped entities
  - Global query filters enforce tenant isolation
  - Tenant resolved from JWT claims or `X-Tenant-Id` / `X-Tenant-Slug` headers
- **Identity + JWT**
  - `ApplicationUser` extends Identity with `TenantId`
  - Token includes `tenant_id` claim
  - Roles: `Admin`, `User`
- **Trello-lite domain**
  - `Tenant → Project → Board → List → Card`
  - Membership + roles at project level
- **Analytics pipeline (stub)**
  - Ingest events
  - Roll-up to daily metrics
  - Summary endpoint for dashboards
- **Billing (stub)**
  - Plans + subscriptions
  - Mock checkout/portal URLs
- **Real-time updates**
  - SignalR hub for board updates

### Frontend (Scaffolded)
- Vite + React (TypeScript)
- Tailwind configured (config + PostCSS)
- Dependencies added for:
  - `zustand` (state management)
  - `@headlessui/react` (UI primitives)
  - `react-router-dom`
- UI implementation still pending

- **Dashboard**: Real-time metrics visualization
- **Services View**: Registered services and health status
- **Alerts View**: Active and historical alert management

---

# 4 NovaQueue - Distributed Job Processing Platform v2.0

**Created with ❤️ by CaptainCode**  
**Company: NovaCore Systems**

> A production-ready, highly scalable distributed job queue system built with Node.js, Redis, and PostgreSQL.

[![GitHub](https://img.shields.io/badge/GitHub-CaptainCode-blue)](https://github.com/captaincode)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/captaincode/novaqueue)

## 🎯 Overview

NovaQueue is a distributed job processing platform designed to handle background tasks reliably at scale. It decouples long-running operations from your main application flow while guaranteeing execution reliability through built-in retry mechanisms, failure handling, and comprehensive monitoring.

### Key Features

✨ **Core Capabilities**
- REST API for job submission and management
- Asynchronous job processing with multiple workers
- Priority-based queue management (Critical, High, Medium, Low)
- Automatic retry with exponential backoff
- Dead Letter Queue (DLQ) for failed jobs
- Support for scheduled (delayed) and cron-based jobs
- Job status tracking and lifecycle monitoring

🚀 **Advanced Features**
- Idempotency support (prevent duplicate execution)
- Distributed lock mechanisms for concurrent safety  
- Comprehensive event logging and audit trails
- Real-time monitoring dashboard
- Horizontal scaling with multiple workers
- WebSocket support for job events
- Multi-tenant queue isolation
- Rate limiting and throttling

📊 **Monitoring & Observability**
- Live dashboard displaying queue statistics
- Job execution metrics and performance analytics
- Worker health monitoring with heartbeats
- System-wide metrics export (Prometheus-compatible)
- Detailed job execution logs and event history

# 5 Distributed E-Commerce Platform (Microservices Architecture)

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
