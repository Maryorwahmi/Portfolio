# Smart Appointment & Booking Platform

A robust, real-time, multi-user appointment booking platform designed to handle high concurrency, prevent double-booking, and provide an intuitive AI-powered booking experience.

## Features

- **Real-time Availability:** View available time slots for different service providers.
- **Concurrency Control:** Utilizes strict database transactions and unique constraints to prevent double-booking, even under heavy load.
- **AI Booking Assistant:** An integrated AI chatbot that can understand natural language, check availability, book appointments, and cancel them. It also asks for clarifications if multiple slots are available and generates natural language confirmations.
- **Authentication:** Simple signup and login system for users.
- **Appointment Reasons:** Users can specify the reason for their appointment.
- **Timezone Management:** All slots are stored in UTC and automatically converted to the user's local timezone on the frontend.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express
- **Database:** SQLite (`better-sqlite3`)
- **AI Integration:** `@google/genai`

## Prerequisites

- Node.js (v18 or higher)

## Setup & Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
   The server will start on `http://localhost:3000`. The SQLite database (`database.sqlite`) will be automatically created and seeded with initial data (including Nigerian doctors and sample time slots).

## Automated Concurrency Testing

To verify the concurrency control and double-booking prevention, you can run the automated test script. This script simulates 10 simultaneous booking requests for the exact same time slot.

\`\`\`bash
npm run test
\`\`\`

You will see that exactly 1 request succeeds (201 Created) while the other 9 are safely rejected (409 Conflict).

## API Documentation

For detailed information about the REST API endpoints, please refer to the [API_DOCS.md](./API_DOCS.md) file.
