# Scalable Real-Time Chat Platform

A production-ready real-time messaging system built with Node.js, Express, Socket.IO, and React.

## Features

- **Real-Time Messaging**: Instant message delivery using WebSockets.
- **Presence Indicators**: See who is online/offline in real-time.
- **Typing Indicators**: Smart typing indicators that only show when a user is actively typing for more than 2 seconds, and hide after 3 seconds of inactivity.
- **Read Receipts**: Messages are marked as read when viewed by the recipient.
- **Custom Status**: Users can set custom status messages that appear below their username.
- **Message Queues**: Offline messages are queued using an in-memory Redis mock and delivered automatically when the user reconnects.
- **Database Persistence**: Messages and user data are persisted using SQLite.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS v4, Lucide React, Vite
- **Backend**: Node.js, Express, Socket.IO
- **Database**: SQLite (in-memory for MVP)
- **Queue/PubSub**: Mock Redis implementation (in-memory)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the application in your browser. You can open multiple tabs and log in with different usernames to test the real-time chat functionality.

## Testing

Run the unit tests for the message queue and presence logic:

```bash
npm run test
```

## Architecture Notes

- The backend uses a modular approach. The `MockRedis` class simulates a real Redis instance for pub/sub and list operations, making it easy to swap out for a real Redis client (like `ioredis`) in a production environment.
- The SQLite database is currently configured to run in memory (`:memory:`) for demonstration purposes. For persistent storage, change the filename in `server.ts` to a local file path (e.g., `./chat.db`).
- The frontend is served by Vite middleware during development and as static files in production.
