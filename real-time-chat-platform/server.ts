import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// --- In-Memory Redis Mock ---
class MockRedis {
  private store = new Map<string, string>();
  private lists = new Map<string, string[]>();
  private subscribers = new Map<string, Set<(message: string) => void>>();

  async set(key: string, value: string) {
    this.store.set(key, value);
  }

  async get(key: string) {
    return this.store.get(key) || null;
  }

  async del(key: string) {
    this.store.delete(key);
  }

  async lpush(key: string, value: string) {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    this.lists.get(key)!.unshift(value);
  }

  async rpop(key: string) {
    const list = this.lists.get(key);
    if (!list || list.length === 0) return null;
    return list.pop() || null;
  }

  async publish(channel: string, message: string) {
    const subs = this.subscribers.get(channel);
    if (subs) {
      subs.forEach(cb => cb(message));
    }
  }

  subscribe(channel: string, callback: (message: string) => void) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);
  }

  unsubscribe(channel: string, callback: (message: string) => void) {
    const subs = this.subscribers.get(channel);
    if (subs) {
      subs.delete(callback);
    }
  }
}

const redis = new MockRedis();

// --- Database Setup ---
let db: any;
async function initDb() {
  db = await open({
    filename: ':memory:', // Using in-memory SQLite for MVP
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      status TEXT,
      custom_status TEXT,
      last_seen INTEGER
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      participant_ids TEXT -- JSON array of user IDs
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT,
      sender_id TEXT,
      content TEXT,
      timestamp INTEGER,
      delivered_status TEXT
    );
  `);
}

async function startServer() {
  await initDb();

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---
  
  // Login / Register
  app.post('/api/auth/login', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    let user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      user = { id: uuidv4(), username, status: 'online', custom_status: '', last_seen: Date.now() };
      await db.run('INSERT INTO users (id, username, status, custom_status, last_seen) VALUES (?, ?, ?, ?, ?)', 
        [user.id, user.username, user.status, user.custom_status, user.last_seen]);
    }
    res.json(user);
  });

  // Get all users (for creating conversations)
  app.get('/api/users', async (req, res) => {
    const users = await db.all('SELECT id, username, status, custom_status, last_seen FROM users');
    res.json(users);
  });

  // Get conversations for a user
  app.get('/api/conversations/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const allConvos = await db.all('SELECT * FROM conversations');
      const userConvos = allConvos.filter((c: any) => {
        try {
          const participants = JSON.parse(c.participant_ids);
          return participants.includes(userId);
        } catch (e) { return false; }
      });

      // Attach last message
      for (const convo of userConvos) {
        const lastMsg = await db.get('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 1', [convo.id]);
        convo.lastMessage = lastMsg;
        try {
          convo.participants = JSON.parse(convo.participant_ids);
        } catch (e) {
          convo.participants = [];
        }
      }
      
      res.json(userConvos);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  // Create conversation
  app.post('/api/conversations', async (req, res) => {
    try {
      const { participantIds } = req.body;
      if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 participants' });
      }

      // Check if conversation already exists
      const allConvos = await db.all('SELECT * FROM conversations');
      const existing = allConvos.find((c: any) => {
        try {
          const parts = JSON.parse(c.participant_ids);
          return parts.length === participantIds.length && parts.every((p: string) => participantIds.includes(p));
        } catch (e) { return false; }
      });

      if (existing) {
        existing.participants = JSON.parse(existing.participant_ids);
        return res.json(existing);
      }

      const id = uuidv4();
      await db.run('INSERT INTO conversations (id, participant_ids) VALUES (?, ?)', [id, JSON.stringify(participantIds)]);
      res.json({ id, participants: participantIds });
    } catch (err) {
      console.error('Error creating conversation:', err);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  // Get messages for a conversation
  app.get('/api/messages/:conversationId', async (req, res) => {
    const messages = await db.all('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [req.params.conversationId]);
    res.json(messages);
  });

  // Send message via REST (fallback)
  app.post('/api/messages', async (req, res) => {
    const { conversationId, senderId, content } = req.body;
    if (!conversationId || !senderId || !content) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    const messageId = uuidv4();
    const timestamp = Date.now();
    
    const message = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      timestamp,
      delivered_status: 'sent'
    };

    await db.run('INSERT INTO messages (id, conversation_id, sender_id, content, timestamp, delivered_status) VALUES (?, ?, ?, ?, ?, ?)',
      [message.id, message.conversation_id, message.sender_id, message.content, message.timestamp, message.delivered_status]);

    io.to(`conv:${conversationId}`).emit('receive_message', message);

    const convo = await db.get('SELECT participant_ids FROM conversations WHERE id = ?', [conversationId]);
    if (convo) {
      const participants = JSON.parse(convo.participant_ids);
      for (const pId of participants) {
        if (pId !== senderId) {
          const status = await redis.get(`presence:${pId}`);
          if (status !== 'online') {
            await redis.lpush(`queue:${pId}`, JSON.stringify(message));
          }
        }
      }
    }
    res.json(message);
  });

  // Get user presence
  app.get('/api/presence/:userId', async (req, res) => {
    const { userId } = req.params;
    const status = await redis.get(`presence:${userId}`) || 'offline';
    const user = await db.get('SELECT last_seen FROM users WHERE id = ?', [userId]);
    res.json({ userId, status, last_seen: user?.last_seen });
  });

  // --- WebSocket Logic ---
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (!userId) {
      socket.disconnect();
      return;
    }

    // Mark user online
    db.run('UPDATE users SET status = "online", last_seen = ? WHERE id = ?', [Date.now(), userId]);
    redis.set(`presence:${userId}`, 'online');
    io.emit('presence_update', { userId, status: 'online' });

    // Join user's personal room for direct messages
    socket.join(`user:${userId}`);

    // Deliver queued messages
    const deliverQueuedMessages = async () => {
      let msgStr = await redis.rpop(`queue:${userId}`);
      while (msgStr) {
        const msg = JSON.parse(msgStr);
        socket.emit('receive_message', msg);
        msgStr = await redis.rpop(`queue:${userId}`);
      }
    };
    deliverQueuedMessages();

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      const { conversationId, content } = data;
      const messageId = uuidv4();
      const timestamp = Date.now();
      
      const message = {
        id: messageId,
        conversation_id: conversationId,
        sender_id: userId,
        content,
        timestamp,
        delivered_status: 'sent'
      };

      // Save to DB
      await db.run('INSERT INTO messages (id, conversation_id, sender_id, content, timestamp, delivered_status) VALUES (?, ?, ?, ?, ?, ?)',
        [message.id, message.conversation_id, message.sender_id, message.content, message.timestamp, message.delivered_status]);

      // Broadcast to conversation room
      io.to(`conv:${conversationId}`).emit('receive_message', message);

      // Queue for offline users
      const convo = await db.get('SELECT participant_ids FROM conversations WHERE id = ?', [conversationId]);
      if (convo) {
        const participants = JSON.parse(convo.participant_ids);
        for (const pId of participants) {
          if (pId !== userId) {
            const status = await redis.get(`presence:${pId}`);
            if (status !== 'online') {
              await redis.lpush(`queue:${pId}`, JSON.stringify(message));
            }
          }
        }
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(`conv:${conversationId}`).emit('typing_update', { userId, conversationId, isTyping });
    });

    // Handle read receipts
    socket.on('mark_read', async (data) => {
      const { conversationId, messageIds } = data;
      if (!messageIds || messageIds.length === 0) return;
      
      const placeholders = messageIds.map(() => '?').join(',');
      await db.run(`UPDATE messages SET delivered_status = 'read' WHERE id IN (${placeholders})`, messageIds);
      
      io.to(`conv:${conversationId}`).emit('messages_read', { conversationId, messageIds });
    });

    // Handle custom status
    socket.on('update_custom_status', async (customStatus) => {
      await db.run('UPDATE users SET custom_status = ? WHERE id = ?', [customStatus, userId]);
      io.emit('custom_status_update', { userId, customStatus });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      db.run('UPDATE users SET status = "offline", last_seen = ? WHERE id = ?', [Date.now(), userId]);
      redis.set(`presence:${userId}`, 'offline');
      io.emit('presence_update', { userId, status: 'offline', last_seen: Date.now() });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
