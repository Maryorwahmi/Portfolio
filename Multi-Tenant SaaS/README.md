# Multi-Tenant SaaS Platform (Flagship Project)

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

## Backend Architecture Notes

Tenant isolation uses a **single database** with a `tenant_id` on all tenant-scoped tables. EF Core applies global query filters so tenant data never leaks across requests. The current tenant is resolved from:

- JWT `tenant_id` claim (primary)
- `X-Tenant-Id` header (fallback)
- `X-Tenant-Slug` header (optional)

## API Endpoints (Current)

### Auth / Tenant
- `POST /api/tenants` — create tenant
- `GET /api/tenants/resolve?slug=...` — resolve tenant
- `POST /api/auth/register` — register user (email + tenant slug)
- `POST /api/auth/login` — login (email + tenant slug)
- `GET /api/auth/me` — current user

### Projects / Boards
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{projectId}`
- `POST /api/projects/{projectId}/members`
- `POST /api/projects/{projectId}/boards`
- `GET /api/boards/{boardId}`
- `POST /api/boards/{boardId}/lists`
- `POST /api/lists/{listId}/cards`
- `PATCH /api/cards/{cardId}`

### Analytics
- `POST /api/analytics/events`
- `GET /api/analytics/summary?days=7`

### Billing (Stub)
- `GET /api/billing/plans`
- `POST /api/billing/subscribe`
- `GET /api/billing/portal`

### Dashboard
- `GET /api/dashboard`

### SignalR
- `WS /hubs/board` — join/leave board groups

## Running Locally

### Prerequisites
- .NET SDK (net10.0)
- PostgreSQL
- Node.js

### Backend
1. Update connection string in:
   - `C:\Users\User\Documents\Multi-Tenant SaaS\backend\src\Platform.Api\appsettings.json`
2. Start API:
   ```bash
   cd backend/src/Platform.Api
   dotnet run
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```

### JWT Settings
Default JWT settings live in:
`C:\Users\User\Documents\Multi-Tenant SaaS\backend\src\Platform.Api\appsettings.json`

Update `Jwt:SigningKey` before any real deployment.

## Files of Interest

- `C:\Users\User\Documents\Multi-Tenant SaaS\backend\src\Platform.Core\Entities`
- `C:\Users\User\Documents\Multi-Tenant SaaS\backend\src\Platform.Infrastructure\Data\ApplicationDbContext.cs`
- `C:\Users\User\Documents\Multi-Tenant SaaS\backend\src\Platform.Api\Controllers`
- `C:\Users\User\Documents\Multi-Tenant SaaS\backend\src\Platform.Api\Program.cs`
- `C:\Users\User\Documents\Multi-Tenant SaaS\frontend\tailwind.config.js`

## Next Steps (Suggested)
1. Build frontend dashboards and project management UI
2. Add real billing integration (Stripe)
3. Add background jobs for analytics aggregation
4. Add migrations and CI

