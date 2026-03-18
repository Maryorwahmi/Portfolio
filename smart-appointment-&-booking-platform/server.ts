import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database('database.sqlite');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('provider', 'client'))
  );

  CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      timezone TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS time_slots (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id),
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      is_booked BOOLEAN NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      slot_id TEXT NOT NULL REFERENCES time_slots(id),
      client_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL CHECK(status IN ('booked', 'cancelled')),
      reason TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Partial index to prevent double booking
  CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_booking ON appointments(slot_id) WHERE status = 'booked';
`);

// Seed some initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)');
  const insertProvider = db.prepare('INSERT INTO providers (id, user_id, name, timezone) VALUES (?, ?, ?, ?)');
  
  insertUser.run('u1', 'Dr. Adeboye', 'adeboye@clinic.com', 'password123', 'provider');
  insertUser.run('u4', 'Dr. Okafor', 'okafor@clinic.com', 'password123', 'provider');
  insertUser.run('u5', 'Dr. Nwachukwu', 'nwachukwu@clinic.com', 'password123', 'provider');
  
  insertUser.run('u2', 'Alice Client', 'alice@example.com', 'password123', 'client');
  insertUser.run('u3', 'Bob Client', 'bob@example.com', 'password123', 'client');
  
  insertProvider.run('p1', 'u1', 'Dr. Adeboye Clinic', 'Africa/Lagos');
  insertProvider.run('p2', 'u4', 'Dr. Okafor Specialist Hospital', 'Africa/Lagos');
  insertProvider.run('p3', 'u5', 'Dr. Nwachukwu Care', 'Africa/Lagos');
  
  // Seed some time slots for tomorrow
  const insertSlot = db.prepare('INSERT INTO time_slots (id, provider_id, start_time, end_time) VALUES (?, ?, ?, ?)');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(8, 0, 0, 0); // 08:00 UTC
  
  let slotIdCounter = 1;
  for (const providerId of ['p1', 'p2', 'p3']) {
    for (let i = 0; i < 5; i++) {
      const start = new Date(tomorrow.getTime() + i * 3600000); // 1 hour slots
      const end = new Date(start.getTime() + 3600000);
      insertSlot.run(`s${slotIdCounter++}`, providerId, start.toISOString(), end.toISOString());
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // Auth Routes
  app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    try {
      const id = 'u' + Date.now() + Math.floor(Math.random() * 1000);
      db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, name, email, password, 'client');
      res.status(201).json({ id, name, email, role: 'client' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(409).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json(user);
  });

  // Get all providers
  app.get('/api/providers', (req, res) => {
    const providers = db.prepare('SELECT * FROM providers').all();
    res.json(providers);
  });

  // Get available slots for a provider
  app.get('/api/providers/:id/slots', (req, res) => {
    const slots = db.prepare(`
      SELECT * FROM time_slots 
      WHERE provider_id = ? AND is_booked = 0 AND start_time > datetime('now')
      ORDER BY start_time ASC
    `).all(req.params.id);
    res.json(slots);
  });

  // Get user's appointments
  app.get('/api/users/:id/appointments', (req, res) => {
    const appointments = db.prepare(`
      SELECT a.*, s.start_time, s.end_time, p.name as provider_name
      FROM appointments a
      JOIN time_slots s ON a.slot_id = s.id
      JOIN providers p ON s.provider_id = p.id
      WHERE a.client_id = ?
      ORDER BY s.start_time ASC
    `).all(req.params.id);
    res.json(appointments);
  });

  // Create an appointment (Booking)
  app.post('/api/appointments', (req, res) => {
    const { slot_id, client_id, reason } = req.body;
    
    if (!slot_id || !client_id) {
      return res.status(400).json({ error: 'slot_id and client_id are required' });
    }

    const id = 'a' + Date.now() + Math.floor(Math.random() * 1000);

    // Use a transaction to ensure atomicity
    const bookTransaction = db.transaction(() => {
      // Check if slot exists and is not booked
      const slot = db.prepare('SELECT * FROM time_slots WHERE id = ?').get(slot_id) as any;
      if (!slot) {
        throw new Error('Slot not found');
      }
      if (slot.is_booked) {
        throw new Error('Slot is already booked');
      }

      // Insert appointment
      db.prepare('INSERT INTO appointments (id, slot_id, client_id, status, reason) VALUES (?, ?, ?, ?, ?)')
        .run(id, slot_id, client_id, 'booked', reason || null);
      
      // Update slot
      db.prepare('UPDATE time_slots SET is_booked = 1 WHERE id = ?').run(slot_id);
      
      return id;
    });

    try {
      const appointmentId = bookTransaction();
      res.status(201).json({ id: appointmentId, message: 'Appointment booked successfully' });
    } catch (error: any) {
      // If the unique index is violated or slot is booked
      if (error.message.includes('UNIQUE constraint failed') || error.message === 'Slot is already booked') {
        res.status(409).json({ error: 'This slot has already been booked. Please choose another.' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Cancel an appointment
  app.patch('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'cancelled') {
      return res.status(400).json({ error: 'Only cancellation is supported via this endpoint' });
    }

    const cancelTransaction = db.transaction(() => {
      const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND status = ?').get(id, 'booked') as any;
      if (!appointment) {
        throw new Error('Active appointment not found');
      }

      // Update appointment status
      db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run('cancelled', id);
      
      // Free up the slot
      db.prepare('UPDATE time_slots SET is_booked = 0 WHERE id = ?').run(appointment.slot_id);
    });

    try {
      cancelTransaction();
      res.json({ message: 'Appointment cancelled successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
