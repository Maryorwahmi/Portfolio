import { describe, it, expect, beforeEach } from 'vitest';

// We can extract MockRedis to test its queue and presence logic
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
}

describe('Message Queue & Presence Logic', () => {
  let redis: MockRedis;

  beforeEach(() => {
    redis = new MockRedis();
  });

  it('should track user presence correctly', async () => {
    const userId = 'user-123';
    
    // User connects
    await redis.set(`presence:${userId}`, 'online');
    let status = await redis.get(`presence:${userId}`);
    expect(status).toBe('online');

    // User disconnects
    await redis.set(`presence:${userId}`, 'offline');
    status = await redis.get(`presence:${userId}`);
    expect(status).toBe('offline');
  });

  it('should queue messages for offline users', async () => {
    const offlineUserId = 'user-456';
    const message = { id: 'msg-1', content: 'Hello!' };

    // Check presence
    const status = await redis.get(`presence:${offlineUserId}`);
    if (status !== 'online') {
      await redis.lpush(`queue:${offlineUserId}`, JSON.stringify(message));
    }

    // User reconnects and retrieves messages (FIFO order)
    const queuedMsgStr = await redis.rpop(`queue:${offlineUserId}`);
    expect(queuedMsgStr).not.toBeNull();
    
    const queuedMsg = JSON.parse(queuedMsgStr!);
    expect(queuedMsg.id).toBe('msg-1');
    expect(queuedMsg.content).toBe('Hello!');

    // Queue should be empty now
    const emptyQueue = await redis.rpop(`queue:${offlineUserId}`);
    expect(emptyQueue).toBeNull();
  });

  it('should maintain message order in queue', async () => {
    const userId = 'user-789';
    
    await redis.lpush(`queue:${userId}`, 'msg1');
    await redis.lpush(`queue:${userId}`, 'msg2');
    await redis.lpush(`queue:${userId}`, 'msg3');

    // rpop should return oldest first (FIFO)
    expect(await redis.rpop(`queue:${userId}`)).toBe('msg1');
    expect(await redis.rpop(`queue:${userId}`)).toBe('msg2');
    expect(await redis.rpop(`queue:${userId}`)).toBe('msg3');
    expect(await redis.rpop(`queue:${userId}`)).toBeNull();
  });
});
