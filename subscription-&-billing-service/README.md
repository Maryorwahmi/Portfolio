# Subscription & Billing Service MVP

A scalable subscription and payment service MVP built with Node.js, Express, React, and Vite. This application allows users to subscribe to plans, handles mock payments, generates PDF invoices, and provides a professional dashboard for managing billing.

## Features

- **User Authentication:** Simple email-based login for accessing the billing portal.
- **Plan Selection:** View available subscription plans (Monthly/Yearly) and subscribe.
- **Subscription Management:** View current active plan, status, and renewal dates.
- **Mock Payment Processing:** Simulate successful or failed payments to test webhook handling and subscription state changes without needing a live Stripe account.
- **PDF Invoices:** Automatically generates and stores PDF invoices upon successful payment.
- **Invoice History:** View past invoices and download them as PDFs.
- **Professional Dashboard:** A clean, responsive UI built with Tailwind CSS and Framer Motion for smooth transitions.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** SQLite (using `better-sqlite3`)
- **PDF Generation:** `pdfkit`
- **Testing:** Node.js native test runner (`node --test`)

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy the `.env.example` file to `.env` (if you plan to use real Stripe keys later). For the MVP, the mock implementation works out of the box without any keys.
   ```bash
   cp .env.example .env
   ```

3. **Run the Development Server:**
   This will start both the Express backend and the Vite frontend.
   ```bash
   npm run dev
   ```

4. **Access the Application:**
   Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:3000`).

## Usage

1. Enter any email address on the login screen to access the portal.
2. Navigate to the **Billing & Plans** tab to subscribe to a plan.
3. Once subscribed, go to the **Dashboard** tab.
4. Use the **Developer Actions (MVP Testing)** section to simulate a successful or failed payment.
5. If you simulate a successful payment, an invoice will be generated.
6. Navigate back to the **Billing & Plans** tab to view your invoice history and download the generated PDF.

## API Endpoints

- `GET /api/plans`: Retrieve available subscription plans.
- `GET /api/subscription?email={email}`: Get the current subscription status for a user.
- `POST /api/subscribe`: Initiate a new subscription.
- `POST /api/mock-payment`: Trigger a mock successful or failed payment webhook.
- `GET /api/invoices?email={email}`: Retrieve invoice history for a user.
- `GET /api/invoices/:id/download`: Download a specific invoice as a PDF.

## Testing

Run the integration tests to verify the core billing logic:

```bash
npm run test
```

## Future Enhancements

- Integration with live Stripe API (using `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`).
- Payment retry logic with exponential backoff.
- Plan upgrades and downgrades.
- Email notifications for invoices and subscription changes.
- User authentication with a real identity provider (e.g., Firebase Auth, Auth0).
